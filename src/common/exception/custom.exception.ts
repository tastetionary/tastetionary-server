import { HttpException, HttpStatus } from '@nestjs/common';

class BaseException extends HttpException {
  readonly additionalData;
  constructor(
    cause?: string,
    howToSolve?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    additionalData?: Record<string, any>,
  ) {
    super(cause ?? '', HttpStatus.BAD_REQUEST, {
      description: howToSolve,
    });
    this.additionalData = additionalData;
  }
}

export class ServiceException extends BaseException {
  constructor(
    cause: string | 'domain rule error',
    description?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    additionalData?: Record<string, any>,
  ) {
    super(cause, description, additionalData);
  }
}

export class CoreException extends BaseException {
  constructor(
    cause: string,
    description?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    additionalData?: Record<string, any>,
  ) {
    super(cause, description, additionalData);
  }
}

export class RepositoryException extends BaseException {
  constructor(
    cause: string,
    description?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    additionalData?: Record<string, any>,
  ) {
    super(cause, description, additionalData);
  }
}
