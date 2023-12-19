import { EnvironmentEnum } from '@root/src/env.validation';

export interface ServerConfig {
  env: EnvironmentEnum;
}

export interface ServerMetaData {
  serverTime: string;
  version: string;
}
