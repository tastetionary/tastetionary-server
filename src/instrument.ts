import * as Sentry from '@sentry/node';

const SENSITIVE_HEADERS = ['authorization', 'cookie'];

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.ENV,
  integrations: [
    Sentry.httpIntegration({ maxIncomingRequestBodySize: 'none' }),
  ],
  beforeSend(event) {
    const headers = event.request?.headers;
    if (headers) {
      for (const key of Object.keys(headers)) {
        if (SENSITIVE_HEADERS.includes(key.toLowerCase())) {
          delete headers[key];
        }
      }
    }
    return event;
  },
});
