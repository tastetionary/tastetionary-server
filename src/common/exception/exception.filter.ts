import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import {
  BaseException,
  CallerWrongUsageException,
} from '@common/exception/internal.exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: BaseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const detailResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      reason: exception.category,
      additionalData: exception.loggedData,
    };

    if (!(exception instanceof CallerWrongUsageException)) {
      Sentry.captureException(exception, { extra: detailResponse });
    }

    // TODO modify detail property on env, when dev, return full response, but prod no
    response.status(status).json(detailResponse);
  }
}
