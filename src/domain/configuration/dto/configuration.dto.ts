import { Environment } from '@root/src/env.validation';

export interface ServerConfig {
  env: Environment;
}

export interface ServerMetaData {
  serverTime: string;
  version: string;
}
