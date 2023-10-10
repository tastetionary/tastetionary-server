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
        '전체',
        '한식',
        '중식',
        '양식',
        '일식',
        '패스트푸드',
        '분식',
        '아시아식',
        '뷔페',
        '샐러드',
        '카페/디저트',
      ],
      keywords: [
        '전체',
        '매콤한',
        '고소한',
        '가벼운',
        '차가운',
        '국물이 진한',
        '깔끔한',
        '따뜻한',
        '달콤한',
        '상큼한',
        '해장에 제격',
        '느끼한',
        '풍미가 있는',
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
