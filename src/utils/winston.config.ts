import { utilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
const { colorize } = winston.format;
import { EnvironmentEnum } from '@src/env.validation';
import { RequestContext } from '@common/logging/request-context';

const env = process.env.ENV;

const requestContextMeta = {
  get requestId() {
    return RequestContext.get()?.requestId;
  },
  get userId() {
    return RequestContext.get()?.userId;
  },
};

const normalizeStack = winston.format((info) => {
  if (Array.isArray(info.stack)) {
    const stack = info.stack.filter(Boolean).join('\n');
    if (stack) {
      info.stack = stack;
    } else {
      delete info.stack;
    }
  }
  return info;
});

const jsonFormat = winston.format.combine(
  normalizeStack(),
  winston.format.timestamp(),
  winston.format.json(),
);

const prettyFormat = winston.format.combine(
  normalizeStack(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  colorize({ all: true }),
  utilities.format.nestLike('taste-dictionary-server', {
    prettyPrint: true,
  }),
);

export const winstonLogger = WinstonModule.createLogger({
  defaultMeta: requestContextMeta,
  transports: [
    new winston.transports.Console({
      level: env === EnvironmentEnum.PRODUCTION ? 'info' : 'silly',
      format: env === EnvironmentEnum.PRODUCTION ? jsonFormat : prettyFormat,
    }),
  ],
});
