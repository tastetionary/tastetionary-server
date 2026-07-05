import { plainToInstance } from 'class-transformer';
import { IsEnum, validateSync, IsNumber, IsString } from 'class-validator';

export enum EnvironmentEnum {
  LOCAL = 'local',
  TEST = 'test',
  DEVELOPMENT = 'dev',
  PRODUCTION = 'prod',
}

class EnvironmentVariables {
  @IsEnum(EnvironmentEnum)
  ENV: EnvironmentEnum;

  @IsNumber()
  API_SERVER_PORT: number;

  @IsString()
  CORS_ORIGINS: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `fail setting config, check env and EnvironmentVariables, desc: ${errors.toString()}`,
    );
  }
  return validatedConfig;
}
