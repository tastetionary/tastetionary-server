import { HttpException, HttpStatus } from '@nestjs/common';

class BaseException extends HttpException {
  readonly additionalData;
  constructor(
    type: 'Service' | 'Core' | 'Repository',
    cause: string,
    howToSolve: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    additionalData: Record<string, any>,
  ) {
    super(type, HttpStatus.BAD_REQUEST, {
      cause,
      description: howToSolve,
    });
    this.additionalData = additionalData;
  }
}

export class ServiceException extends BaseException {
  constructor(
    cause: string,
    description: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    additionalData: Record<string, any>,
  ) {
    super('Service', cause, description, additionalData);
  }
}

export class CoreException extends BaseException {
  constructor(
    cause: string,
    description: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    additionalData: Record<string, any>,
  ) {
    super('Core', cause, description, additionalData);
  }
}

export class RepositoryException extends BaseException {
  constructor(
    cause: string,
    description: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    additionalData: Record<string, any>,
  ) {
    super('Repository', cause, description, additionalData);
  }
}
