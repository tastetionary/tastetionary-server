import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCategoryEnum, ErrorNameEnum } from '@common/exception/enum';

type loggedData = { [key: string]: any };
export class BaseException extends HttpException {
  private readonly _category: ErrorCategoryEnum;
  private readonly _hint?: string;
  private readonly _loggedData?: loggedData;
  constructor(
    category: ErrorCategoryEnum,
    name: ErrorNameEnum,
    message: string,
    hint?: string,
    loggedData?: loggedData,
  ) {
    super(
      HttpException.createBody({ category, name, message }),
      HttpStatus.BAD_REQUEST,
    );
    this.name = name;
    this.message = message;
    this._category = category;
    this._hint = hint;
    this._loggedData = loggedData;
  }

  get category(): ErrorCategoryEnum {
    return this._category;
  }

  get hint(): string | undefined {
    return this._hint;
  }

  get loggedData(): loggedData | undefined {
    return this._loggedData;
  }
}

export class CallerWrongUsageException extends BaseException {
  constructor(
    name: ErrorNameEnum,
    message: string,
    hint?: string,
    loggedData?: loggedData,
  ) {
    super(
      ErrorCategoryEnum.CALLER_WRONG_USAGE_ERROR,
      name,
      message,
      hint,
      loggedData,
    );
  }
}

export class CallerWrongDomainRuleException extends BaseException {
  constructor(
    name: ErrorNameEnum,
    message: string,
    hint?: string,
    loggedData?: loggedData,
  ) {
    super(
      ErrorCategoryEnum.CALLER_WRONG_DOMAIN_ERROR,
      name,
      message,
      hint,
      loggedData,
    );
  }
}

export class SupplierSystemException extends BaseException {
  constructor(
    name: ErrorNameEnum,
    message: string,
    hint?: string,
    loggedData?: loggedData,
  ) {
    super(
      ErrorCategoryEnum.SUPPLIER_SYSTEM_ERROR,
      name,
      message,
      hint,
      loggedData,
    );
  }
}

export class InternalDomainException extends BaseException {
  constructor(
    name: ErrorNameEnum,
    message: string,
    hint?: string,
    loggedData?: loggedData,
  ) {
    super(
      ErrorCategoryEnum.INTERNAL_DOMAIN_ERROR,
      name,
      message,
      hint,
      loggedData,
    );
  }
}
