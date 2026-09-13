import { readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { Logger } from '@nestjs/common';

const logger = new Logger('SbizImport');
const USAGE =
  'usage: DATABASE_URL=postgresql://... npm run import:sbiz -- <csv file or directory>... [--close-missing]';

function resolveCsvPaths(inputs: string[]) {
  return inputs.flatMap((input) => {
    const target = resolve(input);
    if (!statSync(target).isDirectory()) return [target];

    return readdirSync(target)
      .filter((file) => file.endsWith('.csv'))
      .sort()
      .map((file) => join(target, file));
  });
}

async function main() {
  const args = process.argv.slice(2);
  const closeMissing = args.includes('--close-missing');
  const inputs = args.filter((arg) => !arg.startsWith('--'));

  if (!process.env.DATABASE_URL) {
    throw new Error(`DATABASE_URL must be set explicitly\n${USAGE}`);
  }
  if (inputs.length == 0) {
    throw new Error(USAGE);
  }

  const database = new URL(process.env.DATABASE_URL);
  logger.log(`target database: ${database.host}${database.pathname}`);

  const filePaths = resolveCsvPaths(inputs);
  const { importSbizRestaurants } =
    await import('@domain/restaurant/service/sbiz-import.service');
  const { default: prismaClient } = await import('@src/common/database/prisma');

  try {
    const result = await importSbizRestaurants({ filePaths, closeMissing });
    logger.log(`done: ${JSON.stringify(result)}`);
  } finally {
    await prismaClient.$disconnect();
  }
}

main().catch((error) => {
  logger.error(error);
  process.exit(1);
});
