import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  UnauthorizedException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import {
  BaseException,
  CallerWrongUsageException,
  EmptyContentException,
} from '@common/exception/internal.exception';
import { ErrorCodeEnum } from '@common/exception/enum';
import { RequestContext } from '@common/logging/request-context';
import { redactSensitive } from '@common/logging/redact';
import { EnvironmentEnum } from '@src/env.validation';

type ErrorResponseBody = {
  statusCode: number;
  timestamp: string;
  path: string;
  originMessage: string;
  category?: string;
  errorCode?: string;
  additionalData?: unknown;
  input?: unknown;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('EXCEPTION');

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof EmptyContentException) {
      this.sendNoContent(exception, response);
      return;
    }

    const body = this.createResponseBody(exception, request);

    RequestContext.setError({
      errorName: exception.name,
      errorMessage: exception.message,
      errorCode: body.errorCode,
      errorCause: this.describeCause(exception),
    });

    if (this.isServerError(exception, body.statusCode)) {
      this.report(exception, body, request);
    }

    response.status(body.statusCode).json(body);
  }

  private createResponseBody(
    exception: Error,
    request: Request,
  ): ErrorResponseBody {
    const common = {
      timestamp: new Date().toISOString(),
      path: request.url,
      originMessage: exception.message,
    };

    if (exception instanceof BaseException) {
      return {
        ...common,
        statusCode: exception.getStatus(),
        category: exception.category,
        errorCode: exception.errorCode || ErrorCodeEnum.INTERNAL_SERVER_ERROR,
        additionalData: exception.loggedData,
      };
    }

    if (
      exception instanceof BadRequestException ||
      exception instanceof UnauthorizedException
    ) {
      return {
        ...common,
        statusCode: exception.getStatus(),
        additionalData: exception.getResponse(),
        input: this.exposeInput(request),
      };
    }

    if (exception instanceof HttpException) {
      return { ...common, statusCode: exception.getStatus() };
    }

    return {
      ...common,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      input: this.exposeInput(request),
    };
  }

  private sendNoContent(exception: EmptyContentException, response: Response) {
    const noContentReason = exception.getResponse()['message'] || 'no content';
    try {
      response
        .status(204)
        .setHeader('no-content-reason', noContentReason)
        .send();
    } catch (e) {
      this.logger.warn({
        message: 'failed to set no-content-reason header',
        noContentReason,
        errorMessage: e.message,
      });
      response.status(204).send();
    }
  }

  private isServerError(exception: Error, statusCode: number) {
    if (exception instanceof BaseException) {
      return !(exception instanceof CallerWrongUsageException);
    }
    return statusCode >= HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private report(exception: Error, body: ErrorResponseBody, request: Request) {
    const context = RequestContext.get();
    const extra = redactSensitive({ ...body, input: request.body });

    this.logger.error(
      {
        message: exception.message,
        errorName: exception.name,
        errorCode: body.errorCode,
        statusCode: body.statusCode,
        method: request.method,
        path: request.originalUrl.split('?')[0],
        additionalData: extra.additionalData,
      },
      exception.stack,
    );

    Sentry.withScope((scope) => {
      if (context?.userId !== undefined) {
        scope.setUser({ id: String(context.userId) });
      }
      if (context) {
        scope.setTag('request_id', context.requestId);
      }
      scope.setExtras(extra);
      Sentry.captureException(exception);
    });
  }

  private describeCause(exception: Error) {
    const { cause } = exception as { cause?: unknown };
    return cause instanceof Error ? cause.message : undefined;
  }

  private exposeInput(request: Request) {
    if (process.env.ENV === EnvironmentEnum.PRODUCTION) {
      return undefined;
    }
    return redactSensitive(request.body);
  }
}
