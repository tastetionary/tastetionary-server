import { redactSensitive, summarizeHttpError } from '@common/logging/redact';

describe('redactSensitive', () => {
  it('should redact sensitive keys at any depth', () => {
    const result = redactSensitive({
      account: { identification: 'a@b.com', password: 'pw', category: 'EMAIL' },
      sessions: [{ accessToken: 'at', refreshToken: 'rt' }],
      code: '123456',
      errorCode: 'INVALID_CREDENTIALS',
    });

    expect(result).toEqual({
      account: {
        identification: '[REDACTED]',
        password: '[REDACTED]',
        category: 'EMAIL',
      },
      sessions: [{ accessToken: '[REDACTED]', refreshToken: '[REDACTED]' }],
      code: '[REDACTED]',
      errorCode: 'INVALID_CREDENTIALS',
    });
  });

  it('should keep primitives and dates as they are', () => {
    const date = new Date();

    expect(redactSensitive('text')).toBe('text');
    expect(redactSensitive(undefined)).toBeUndefined();
    expect(redactSensitive({ createdAt: date })).toEqual({ createdAt: date });
  });
});

describe('summarizeHttpError', () => {
  it('should keep status and body without request config', () => {
    const axiosLikeError = {
      message: 'Request failed with status code 400',
      config: { data: { client_secret: 'leak' } },
      response: { status: 400, data: { error: 'invalid_grant' } },
    };

    expect(summarizeHttpError(axiosLikeError)).toEqual({
      errorMessage: 'Request failed with status code 400',
      status: 400,
      responseBody: { error: 'invalid_grant' },
    });
  });
});
