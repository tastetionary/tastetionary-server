import {
  CanActivate,
  Controller,
  Get,
  INestApplication,
  Injectable,
  Logger,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import * as Sentry from '@sentry/node';
import { LoggingModule } from '@common/logging/logging.module';
import { RequestContext } from '@common/logging/request-context';
import { CallerWrongUsageException } from '@common/exception/internal.exception';
import { ErrorCodeEnum, ErrorSubCategoryEnum } from '@common/exception/enum';

jest.mock('@sentry/node', () => {
  const scope = { setUser: jest.fn(), setTag: jest.fn(), setExtras: jest.fn() };
  return {
    scope,
    withScope: jest.fn((callback) => callback(scope)),
    captureException: jest.fn(),
  };
});

const sentryScope = (Sentry as unknown as { scope: Record<string, jest.Mock> })
  .scope;

@Injectable()
class FakeAuthGuard implements CanActivate {
  canActivate() {
    RequestContext.setUserId(7);
    return true;
  }
}

@Controller('test')
class TestController {
  @Get('context')
  @UseGuards(FakeAuthGuard)
  async context() {
    await new Promise((resolve) => setTimeout(resolve, 5));
    return RequestContext.get();
  }

  @Post('caller-error')
  callerError() {
    throw new CallerWrongUsageException(
      ErrorSubCategoryEnum.INVALID_INPUT,
      'identification or password is not matched',
      ErrorCodeEnum.INVALID_CREDENTIALS,
    );
  }

  @Post('unauthorized')
  unauthorized() {
    throw new UnauthorizedException('invalid token', {
      cause: new Error('jwt expired'),
    });
  }

  @Get('unknown')
  @UseGuards(FakeAuthGuard)
  unknown() {
    throw new Error('boom');
  }
}

const flushFinishEvents = () => new Promise((resolve) => setImmediate(resolve));

describe('LoggingModule', () => {
  let app: INestApplication;
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [LoggingModule],
      controllers: [TestController],
      providers: [FakeAuthGuard],
    }).compile();

    app = module.createNestApplication({ logger: false });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should keep request id and user id across async handlers', async () => {
    const res = await request(app.getHttpServer()).get('/test/context');

    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).toBe(res.body.requestId);
    expect(res.body.userId).toBe(7);
  });

  it('should reuse a valid incoming request id and replace an invalid one', async () => {
    const valid = await request(app.getHttpServer())
      .get('/test/context')
      .set('x-request-id', 'client-req-1');
    const invalid = await request(app.getHttpServer())
      .get('/test/context')
      .set('x-request-id', 'forged" level="error');

    expect(valid.headers['x-request-id']).toBe('client-req-1');
    expect(invalid.headers['x-request-id']).not.toContain('forged');
  });

  it('should write an access log for successful requests', async () => {
    await request(app.getHttpServer()).get('/test/context');
    await flushFinishEvents();

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/test/context',
        statusCode: 200,
        durationMs: expect.any(Number),
      }),
    );
  });

  it('should log caller errors as warn with error code and skip sentry', async () => {
    const res = await request(app.getHttpServer())
      .post('/test/caller-error')
      .send({ identification: 'a@b.com', password: 'secret' });
    await flushFinishEvents();

    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe(ErrorCodeEnum.INVALID_CREDENTIALS);
    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        errorCode: ErrorCodeEnum.INVALID_CREDENTIALS,
      }),
    );
  });

  it('should redact sensitive input and record the error cause', async () => {
    const res = await request(app.getHttpServer())
      .post('/test/unauthorized')
      .send({
        identification: 'a@b.com',
        password: 'secret',
        category: 'EMAIL',
      });
    await flushFinishEvents();

    expect(res.status).toBe(401);
    expect(res.body.input).toEqual({
      identification: '[REDACTED]',
      password: '[REDACTED]',
      category: 'EMAIL',
    });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, errorCause: 'jwt expired' }),
    );
  });

  it('should respond 500 for unknown errors and report them with user context', async () => {
    const res = await request(app.getHttpServer()).get('/test/unknown');
    await flushFinishEvents();

    expect(res.status).toBe(500);
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(sentryScope.setUser).toHaveBeenCalledWith({ id: '7' });
    expect(sentryScope.setTag).toHaveBeenCalledWith(
      'request_id',
      res.headers['x-request-id'],
    );
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'boom', statusCode: 500 }),
      expect.stringContaining('Error: boom'),
    );
  });
});
