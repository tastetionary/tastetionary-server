import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import {
  RequestContext,
  RequestContextStore,
} from '@common/logging/request-context';

export const REQUEST_ID_HEADER = 'x-request-id';
const VALID_REQUEST_ID = /^[\w-]{1,64}$/;
const SILENT_PATH_PREFIXES = ['/health'];

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const store: RequestContextStore = {
      requestId: this.resolveRequestId(req),
    };
    const startedAt = performance.now();

    res.setHeader(REQUEST_ID_HEADER, store.requestId);
    res.on('finish', () =>
      RequestContext.run(store, () =>
        this.logAccess(req, res, store, startedAt),
      ),
    );

    RequestContext.run(store, next);
  }

  private resolveRequestId(req: Request) {
    const incoming = req.headers[REQUEST_ID_HEADER];
    if (typeof incoming === 'string' && VALID_REQUEST_ID.test(incoming)) {
      return incoming;
    }
    return randomUUID();
  }

  private logAccess(
    req: Request,
    res: Response,
    store: RequestContextStore,
    startedAt: number,
  ) {
    const path = req.originalUrl.split('?')[0];
    const statusCode = res.statusCode;

    if (
      statusCode < 400 &&
      SILENT_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))
    ) {
      return;
    }

    const durationMs = Math.round(performance.now() - startedAt);
    const entry = {
      message: `${req.method} ${path} ${statusCode} ${durationMs}ms`,
      method: req.method,
      path,
      statusCode,
      durationMs,
      ...store.error,
    };

    if (statusCode >= 500) {
      this.logger.error(entry);
    } else if (statusCode >= 400) {
      this.logger.warn(entry);
    } else {
      this.logger.log(entry);
    }
  }
}
