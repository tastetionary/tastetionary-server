export enum ErrorCategoryEnum {
  CALLER_WRONG_USAGE_ERROR = 'caller_wrong_usage_error',
  CALLER_WRONG_DOMAIN_ERROR = 'caller_wrong_domain_error',
  SUPPLIER_SYSTEM_ERROR = 'supplier_system_error',
  INTERNAL_DOMAIN_ERROR = 'internal_domain_error',
}

export enum ErrorSubCategoryEnum {
  INVALID_INPUT = 'invalid_input',
  UNEXPECTED_STATUS = 'unexpected_status',
  NO_DATA = 'no_data',
  INTERNAL_ERROR = 'internal_error',
}
