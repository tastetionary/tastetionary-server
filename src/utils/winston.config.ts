import { utilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as winstonDaily from 'winston-daily-rotate-file';
const { colorize } = winston.format;

const env = process.env.ENV;
const logDir = `${process.cwd()}/logs`;

const dailyOptions = (level: string) => {
  return {
    level,
    datePattern: 'YYYY-MM-DD',
    dirname: logDir + `/${level}`,
    filename: `%DATE%.${level}.log`,
    maxFiles: 30,
    zippedArchive: true,
  };
};

export const winstonLogger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      level: env === 'production' ? 'info' : 'silly',
      format:
        env === 'production'
          ? winston.format.simple()
          : winston.format.combine(
              winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
              }),
              colorize({ all: true }),
              utilities.format.nestLike('taste-dictionary-server', {
                prettyPrint: true,
              }),
            ),
    }),

    new winstonDaily(dailyOptions('info')),
    new winstonDaily(dailyOptions('warn')),
    new winstonDaily(dailyOptions('error')),
  ],
});
