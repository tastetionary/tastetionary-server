import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    function isValidationFailure(
      exception: any,
    ): exception is { message: string } {
      return (
        exception &&
        !['Service', 'Core', 'Repository'].includes(exception.message)
      );
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const detailResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      reason: exception['options'],
      additionalData: exception['additionalData'],
    };

    if (isValidationFailure(exception)) {
      detailResponse['detail'] = {
        reason: exception['message'],
        additionalData: exception['response'],
      };
    }
    Sentry.captureException(exception, { extra: detailResponse });
    // TODO modify detail property on env, when dev, return full response, but prod no
    response.status(status).json(detailResponse);
  }
}
