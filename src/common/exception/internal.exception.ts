import { HttpException, HttpStatus } from '@nestjs/common';
import {
  ErrorCategoryEnum,
  ErrorSubCategoryEnum,
} from '@common/exception/enum';

export interface ErrorContents {
  subCategory: ErrorSubCategoryEnum;
  message: string;
  hint?: string;
}

export interface BadRequestExceptionResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  category?: ErrorCategoryEnum;
  additionalData?: any;
  originMessage: string;
  input?: any;
}

type loggedData = { [key: string]: any };
export class BaseException extends HttpException {
  private readonly _category: ErrorCategoryEnum;
  private readonly _hint?: string;
  private readonly _loggedData?: loggedData;
  constructor(
    category: ErrorCategoryEnum,
    name: ErrorSubCategoryEnum,
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
    name: ErrorSubCategoryEnum,
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
    name: ErrorSubCategoryEnum,
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
    name: ErrorSubCategoryEnum,
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
    name: ErrorSubCategoryEnum,
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

// TODO 차후 empty content 방법 정리 되면 제거할 예정, 현재는 short return 때문에만 사용
export class EmptyContentException extends HttpException {
  constructor(message: string) {
    super(HttpException.createBody({ message }), HttpStatus.NO_CONTENT);
  }
}

export class ConflictException extends HttpException {
  constructor(message: string) {
    super(HttpException.createBody({ message }), HttpStatus.CONFLICT);
  }
}
