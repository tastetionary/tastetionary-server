import { truncateTables } from '@root/jest.setup';
import prismaClient from '@root/src/common/database/prisma';
import {
  RestaurantCategory,
  RestaurantSource,
} from '@domain/restaurant/restaurant.enum';
import {
  importSbizRestaurants,
  mapSbizCategory,
  parseCsvLine,
  toSbizRestaurant,
} from '@domain/restaurant/service/sbiz-import.service';

const FIXTURE_PATH = 'test/fixtures/sbiz/sbiz-sample.csv';

describe('sbiz import service', () => {
  describe('mapSbizCategory', () => {
    it.each([
      ['I20107', '수향갈비', RestaurantCategory.KOREAN],
      ['I20202', '야미마라탕', RestaurantCategory.CHINESE],
      ['I20301', '미카도스시', RestaurantCategory.JAPANESE],
      ['I20402', '파스타지아니', RestaurantCategory.WESTERN],
      ['I20501', '헬로베트남쌀국수', RestaurantCategory.ASIAN],
      ['I20702', '명륜한식부페', RestaurantCategory.BUFFET],
      ['I21006', '태권치킨', RestaurantCategory.FAST_FOOD],
      ['I21007', '명만두분식', RestaurantCategory.SNACK],
      ['I21201', '할리스', RestaurantCategory.CAFE_AND_DESERT],
      ['I21001', '크리스피크림', RestaurantCategory.CAFE_AND_DESERT],
      ['I21005', '갓샐러드', RestaurantCategory.SALAD],
      ['I21005', 'Poke All Day', RestaurantCategory.SALAD],
      ['I21005', '이삭토스트', RestaurantCategory.FAST_FOOD],
    ])('%s %s should be %s', (code, name, expected) => {
      expect(mapSbizCategory(code, name)).toBe(expected);
    });

    it.each([
      ['I21104', '요리 주점'],
      ['I21103', '생맥주 전문'],
      ['I20701', '구내식당'],
      ['I21099', '그 외 기타 간이 음식점'],
      ['I20601', '분류 안된 외국식 음식점'],
      ['G21503', '화장품 소매업'],
    ])('%s (%s) should be excluded', (code, name) => {
      expect(mapSbizCategory(code, name)).toBeNull();
    });
  });

  describe('parseCsvLine', () => {
    it('should parse quoted fields with commas, escaped quotes and empty values', () => {
      const line = '"MA1","엄마손, ""진짜"" 김밥","",809,,127.029,37.507';
      expect(parseCsvLine(line)).toEqual([
        'MA1',
        '엄마손, "진짜" 김밥',
        '',
        '809',
        '',
        '127.029',
        '37.507',
      ]);
    });
  });

  describe('toSbizRestaurant', () => {
    const row = {
      상가업소번호: 'MA0000000000000000001',
      상호명: '수향갈비',
      지점명: '강남점',
      상권업종소분류코드: 'I20107',
      지번주소: '서울특별시 강남구 역삼동 809',
      도로명주소: '서울특별시 강남구 강남대로 464',
      경도: '127.025322018329',
      위도: '37.5037083174499',
    };

    it('should build record with branch name and kakao map link', () => {
      expect(toSbizRestaurant(row)).toEqual({
        sourceId: 'MA0000000000000000001',
        name: '수향갈비 강남점',
        address: '서울특별시 강남구 강남대로 464',
        latitude: 37.5037083174499,
        longitude: 127.025322018329,
        referenceLink: `https://map.kakao.com/link/map/${encodeURIComponent(
          '수향갈비 강남점',
        )},37.5037083174499,127.025322018329`,
        category: RestaurantCategory.KOREAN,
        sourceCategoryCode: 'I20107',
      });
    });

    it('should fall back to lot number address', () => {
      expect(toSbizRestaurant({ ...row, 도로명주소: '' })?.address).toBe(
        '서울특별시 강남구 역삼동 809',
      );
    });

    it('with excluded category, should return null', () => {
      expect(
        toSbizRestaurant({ ...row, 상권업종소분류코드: 'I21104' }),
      ).toBeNull();
    });

    it('without coordinates, should return null', () => {
      expect(toSbizRestaurant({ ...row, 경도: '', 위도: '' })).toBeNull();
    });
  });

  describe('importSbizRestaurants', () => {
    beforeEach(async () => {
      await truncateTables(prismaClient, ['external_restaurant_informations']);
    });

    it('should import only mapped restaurants and be idempotent', async () => {
      const first = await importSbizRestaurants({
        filePaths: [FIXTURE_PATH],
        closeMissing: false,
      });
      expect(first).toEqual({ imported: 3, skipped: 2, closed: 0 });

      await importSbizRestaurants({
        filePaths: [FIXTURE_PATH],
        closeMissing: true,
      });

      const rows = await prismaClient.externalRestaurantInformations.findMany({
        orderBy: { source_id: 'asc' },
      });
      expect(
        rows.map((r) => [r.source_id, r.name, r.category, r.address]),
      ).toEqual([
        [
          'MA0000000000000000001',
          '수향갈비 강남점',
          RestaurantCategory.KOREAN,
          '서울특별시 강남구 강남대로 464',
        ],
        [
          'MA0000000000000000002',
          '갓샐러드',
          RestaurantCategory.SALAD,
          '서울특별시 강남구 역삼동 809',
        ],
        [
          'MA0000000000000000005',
          '엄마손, "진짜" 김밥',
          RestaurantCategory.SNACK,
          '서울특별시 강남구 강남대로 466',
        ],
      ]);
      rows.forEach((r) => {
        expect(r.source).toBe(RestaurantSource.SBIZ);
        expect(r.external_uuid).toBeNull();
        expect(r.closed_at).toBeNull();
      });
    });
  });
});
