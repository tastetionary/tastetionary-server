import { TestingModule } from '@nestjs/testing';
import { appModuleFixture } from '@root/jest.setup';
import { FoodRepository } from './food.repository';
import { FoodCategory, FoodKeyword } from '../food.enum';

describe('Food repository', () => {
  let repo: FoodRepository;
  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [FoodRepository],
    )) as TestingModule;
    repo = module.get(FoodRepository);
  });

  it('should get food options', async () => {
    const res = await repo.getFoodOptions();
    const expected = {
      categories: [
        {
          id: 0,
          name: '전체',
          icon: 'menu_all',
        },
        {
          id: 1,
          name: '한식',
          icon: 'menu_korean',
        },
        {
          id: 2,
          name: '중식',
          icon: 'menu_chinese',
        },
        {
          id: 3,
          name: '양식',
          icon: 'menu_western',
        },
        {
          id: 4,
          name: '일식',
          icon: 'menu_japanese',
        },
        {
          id: 5,
          name: '패스트푸드',
          icon: 'menu_fastfood',
        },
        {
          id: 6,
          name: '분식',
          icon: 'menu_snack',
        },
        {
          id: 7,
          name: '아시아식',
          icon: 'menu_asian',
        },
        {
          id: 8,
          name: '뷔페',
          icon: 'menu_buffet',
        },
        {
          id: 9,
          name: '샐러드',
          icon: 'menu_salad',
        },
        {
          id: 10,
          name: '카페/디저트',
          icon: 'menu_cafedessert',
        },
      ],
      keywords: [
        {
          id: 0,
          name: '전체',
        },
        {
          id: 1,
          name: '매콤한',
        },
        {
          id: 2,
          name: '고소한',
        },
        {
          id: 3,
          name: '가벼운',
        },
        {
          id: 4,
          name: '차가운',
        },
        {
          id: 5,
          name: '국물이 진한',
        },
        {
          id: 6,
          name: '깔끔한',
        },
        {
          id: 7,
          name: '따뜻한',
        },
        {
          id: 8,
          name: '달콤한',
        },
        {
          id: 9,
          name: '상큼한',
        },
        {
          id: 10,
          name: '해장에 제격',
        },
        {
          id: 11,
          name: '느끼한',
        },
        {
          id: 12,
          name: '풍미가 있는',
        },
      ],
    };

    expect(res).toEqual(expected);
  });

  it('should return foods by condition', async () => {
    const categories = [FoodCategory.KOREAN, FoodCategory.CHINESE];
    const keywords = [FoodKeyword.SPICY, FoodKeyword.GREASY];

    const res = await repo.getFoodsByCondition({ categories, keywords });

    const categoryResult = res.map((r) => r.category);
    const containsCategory = categoryResult.map((arr) =>
      arr.some((c) => categories.includes(c as FoodCategory)),
    );
    expect(containsCategory.every((value) => value === true)).toBe(true);

    const keywordResult = res.map((r) => r.keyword);
    const containKeyword = keywordResult.map((arr) =>
      arr.some((k) => keywords.includes(k as FoodKeyword)),
    );
    expect(containKeyword.every((value) => value === true)).toBe(true);
  });
});
