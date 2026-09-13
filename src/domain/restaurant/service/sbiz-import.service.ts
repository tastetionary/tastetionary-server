import { createReadStream } from 'fs';
import { basename } from 'path';
import { createInterface } from 'readline';
import { Logger } from '@nestjs/common';
import { RestaurantCategory } from '@domain/restaurant/restaurant.enum';
import {
  closeUnsyncedSbizRestaurants,
  SbizRestaurantRecord,
  upsertSbizRestaurants,
} from '@domain/restaurant/repository/restaurant.repository';

const logger = new Logger('SbizImport');
const BATCH_SIZE = 1000;

const MID_CATEGORY_MAP: Record<string, RestaurantCategory> = {
  I201: RestaurantCategory.KOREAN,
  I202: RestaurantCategory.CHINESE,
  I203: RestaurantCategory.JAPANESE,
  I204: RestaurantCategory.WESTERN,
  I205: RestaurantCategory.ASIAN,
};

const SMALL_CATEGORY_MAP: Record<string, RestaurantCategory> = {
  I20702: RestaurantCategory.BUFFET,
  I21001: RestaurantCategory.CAFE_AND_DESERT,
  I21002: RestaurantCategory.CAFE_AND_DESERT,
  I21003: RestaurantCategory.FAST_FOOD,
  I21004: RestaurantCategory.FAST_FOOD,
  I21006: RestaurantCategory.FAST_FOOD,
  I21007: RestaurantCategory.SNACK,
  I21008: RestaurantCategory.CAFE_AND_DESERT,
  I21201: RestaurantCategory.CAFE_AND_DESERT,
};

const SANDWICH_SALAD_CODE = 'I21005';
const SALAD_NAME_PATTERN = /샐러드|포케|salad|poke/i;

export function mapSbizCategory(
  code: string,
  name: string,
): RestaurantCategory | null {
  if (code == SANDWICH_SALAD_CODE) {
    return SALAD_NAME_PATTERN.test(name)
      ? RestaurantCategory.SALAD
      : RestaurantCategory.FAST_FOOD;
  }

  return SMALL_CATEGORY_MAP[code] ?? MID_CATEGORY_MAP[code.slice(0, 4)] ?? null;
}

export function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quoted) {
      if (char == '"' && line[i + 1] == '"') {
        field += '"';
        i++;
      } else if (char == '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char == '"') {
      quoted = true;
    } else if (char == ',') {
      fields.push(field);
      field = '';
    } else {
      field += char;
    }
  }

  fields.push(field);
  return fields;
}

export function toSbizRestaurant(
  row: Record<string, string>,
): SbizRestaurantRecord | null {
  const sourceId = row['상가업소번호'];
  const baseName = row['상호명'];
  const name = row['지점명'] ? `${baseName} ${row['지점명']}` : baseName;
  const sourceCategoryCode = row['상권업종소분류코드'];
  const category = mapSbizCategory(sourceCategoryCode, name);
  const longitude = parseFloat(row['경도']);
  const latitude = parseFloat(row['위도']);

  if (
    !sourceId ||
    !baseName ||
    !category ||
    !Number.isFinite(longitude) ||
    !Number.isFinite(latitude)
  ) {
    return null;
  }

  return {
    sourceId,
    name: name.slice(0, 128),
    address: (row['도로명주소'] || row['지번주소'] || '').slice(0, 128),
    latitude,
    longitude,
    referenceLink: `https://map.kakao.com/link/map/${encodeURIComponent(
      name.replace(/,/g, ' '),
    )},${latitude},${longitude}`,
    category,
    sourceCategoryCode,
  };
}

async function importSbizFile(filePath: string, syncedAt: Date) {
  const lines = createInterface({
    input: createReadStream(filePath, 'utf-8'),
    crlfDelay: Infinity,
  });

  let header: string[] | null = null;
  let batch: SbizRestaurantRecord[] = [];
  let imported = 0;
  let skipped = 0;

  for await (const line of lines) {
    if (!line) continue;

    const fields = parseCsvLine(line);
    if (!header) {
      header = fields.map((key) => key.trim());
      continue;
    }

    const row = Object.fromEntries(
      header.map((key, index) => [key, fields[index] ?? '']),
    );
    const record = toSbizRestaurant(row);
    if (!record) {
      skipped++;
      continue;
    }

    batch.push(record);
    if (batch.length >= BATCH_SIZE) {
      await upsertSbizRestaurants(batch, syncedAt);
      imported += batch.length;
      batch = [];
    }
  }

  await upsertSbizRestaurants(batch, syncedAt);
  imported += batch.length;

  return { imported, skipped };
}

export async function importSbizRestaurants(param: {
  filePaths: string[];
  closeMissing: boolean;
}) {
  const syncedAt = new Date();
  let imported = 0;
  let skipped = 0;

  for (const filePath of param.filePaths) {
    const result = await importSbizFile(filePath, syncedAt);
    imported += result.imported;
    skipped += result.skipped;
    logger.log(
      `${basename(filePath)}: imported ${result.imported}, skipped ${result.skipped}`,
    );
  }

  const closed = param.closeMissing
    ? await closeUnsyncedSbizRestaurants(syncedAt)
    : 0;

  return { imported, skipped, closed };
}
