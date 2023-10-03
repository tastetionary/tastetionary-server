import { TestingModule } from '@nestjs/testing';
import { appModuleFixture } from '@root/jest.setup';
import { FoodService } from './food.service';
import { FoodModule } from '../food.module';
import { FoodCategory, FoodKeyword } from '../food.enum';

describe('food service', () => {
  let module: TestingModule;
  let service: FoodService;
  beforeAll(async () => {
    module = (await appModuleFixture([], [], [FoodModule])) as TestingModule;
    service = module.get(FoodService);
  });

  const data = {
    categories: [FoodCategory.KOREAN, FoodCategory.CHINESE],
    keywords: [FoodKeyword.SPICY, FoodKeyword.GREASY],
  };

  it('should get recommend Food', async () => {
    await expect(service.getRecommendedFood(data)).toHaveLength(1);
  });
});
