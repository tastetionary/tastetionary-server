import { Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let appServiceFixture:CallableFunction;
let appModuleFixture:CallableFunction;
beforeAll(async () => {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appServiceFixture = async(providers:Provider<any>[], env='test'):Promise<TestingModule>=>{
    return await Test.createTestingModule({
      providers: providers,
      imports: [
        ConfigModule.forRoot({
          cache: true,
          isGlobal: true,
          envFilePath: `.env.${env}`,
        }),
      ],
    }).compile();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appModuleFixture = async(controllers:any[], providers:Provider<any>[],importers:any[]=[], env='test'):Promise<TestingModule>=>{
    return await Test.createTestingModule({
      controllers,
      providers,
      imports: [
        ...importers,
        ConfigModule.forRoot({
          cache: true,
          isGlobal: true,
          envFilePath: `.env.${env}`,
        }),
      ],
    }).compile();
  };
});

export {appServiceFixture, appModuleFixture};