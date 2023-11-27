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
  EmptyContentException,
} from '@common/exception/internal.exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: BaseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (exception instanceof EmptyContentException) {
      const noContentReason =
        exception.getResponse()['message'] || 'no content';
      response
        .status(204)
        .setHeader('no-content-reason', noContentReason)
        .send();
      return;
    } else {
      const detailResponse = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        category: exception.category,
        additionalData: exception.loggedData,
      };

      if (!(exception instanceof CallerWrongUsageException)) {
        Sentry.captureException(exception, { extra: detailResponse });
      }

      // TODO modify detail property on env, when dev, return full response, but prod no
      response.status(status).json(detailResponse);
    }
  }
}
