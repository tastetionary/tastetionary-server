import * as winston from 'winston';
import { PostgresTransport } from '@innova2/winston-pg';
import { ConfigService } from '@nestjs/config';
import { ConfigurationService } from '@domain/configuration/configuration.service';

export class ResultLogTable {
  level: string;
  timestamp: string;
  message: string;
  type: string;
  keyword: string;
  category: string;
}

const configService = new ConfigurationService(new ConfigService());
const pgTransport = new PostgresTransport<ResultLogTable>({
  connectionString: configService.getDataBaseUrl() || '',
  maxPool: 10,
  tableName: 'sample_logs',
  tableColumns: [
    {
      name: 'level',
      dataType: 'VARCHAR',
    },
    {
      name: 'timestamp',
      dataType: 'TIMESTAMP',
    },
    {
      name: 'message',
      dataType: 'VARCHAR',
    },
    {
      name: 'type',
      dataType: 'character varying',
    },
    {
      name: 'keyword',
      dataType: 'character varying',
    },
    {
      name: 'category',
      dataType: 'character varying',
    },
  ],
});

export const winstonLogger = winston.createLogger({
  level: 'info',
  transports: [pgTransport as unknown as winston.transport],
});
