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

export enum ErrorCodeEnum {
  // Caller wrong usage error
  // Caller Wrong Domain Error (1000-1999)
  MISSING_REQUIRED_FIELD = 'ERR1000',
  INVALID_NICKNAME = 'ERR1001',
  INVALID_NICKNAME_FORMAT = 'ERR1002',
  DUPLICATE_NIKCNAME = 'ERR1003',
  EXCLUDED_RESTAURANT = 'ERR1004',
  PREFERRED_RESTAURANT = 'ERR1005',
  MISSING_USER_AREA = 'ERR1006',
  INVALID_CREDENTIALS = 'ERR1007',
  INVALID_AUTH_CODE = 'ERR1008',
  ACCOUNT_NOT_FOUND = 'ERR1009',
  AUTH_CODE_EXPRIED = 'ERR1010',
  DUPLICATE_AUTH_REQUEST = 'ERR1011',
  DUPLICATE_IDENTIFICATION = 'ERR1012',
  INVALID_AUTH_TYPE = 'ERR1013',
  INVALID_SOCIAL_AUTH_TYPE = 'ERR1014',
  INVALID_VALUE = 'ERR1015',
  FORBIDDEN = 'ERR1016',

  // Supplier System Error (3000-3999)
  EXTERNAL_SERVICE_ERROR = 'ERR3001',

  // Internal Domain Error (5000-5999)
  INTERNAL_SERVER_ERROR = 'ERR5001',
}
