const REDACTED = '[REDACTED]';
const SENSITIVE_KEY =
  /password|token|secret|authorization|cookie|^code$|^email$|^identification$/i;
const MAX_DEPTH = 5;

export function redactSensitive<T>(value: T, depth = 0): T {
  if (value === null || typeof value !== 'object' || value instanceof Date) {
    return value;
  }

  if (depth >= MAX_DEPTH) {
    return REDACTED as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item, depth + 1)) as T;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEY.test(key) ? REDACTED : redactSensitive(item, depth + 1),
    ]),
  ) as T;
}

export function summarizeHttpError(error: any) {
  return {
    errorMessage: error?.message,
    status: error?.response?.status ?? error?.statusCode,
    responseBody: redactSensitive(error?.response?.data ?? error?.body),
  };
}
