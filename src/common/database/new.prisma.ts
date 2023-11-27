import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { ConfigurationService } from '@domain/configuration/configuration.service';

// TODO config 사용 방식 변경 해야함, global 레벨에서 바로 가져올 수 있도록
const configService = new ConfigurationService(new ConfigService());
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: configService.getDataBaseUrl(),
      },
    },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const newPrisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default newPrisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = newPrisma;
