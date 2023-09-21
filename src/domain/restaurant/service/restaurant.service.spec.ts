import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { PrismaService } from '@common/database/prisma.service';
import { RestaurantCategory } from '@domain/restaurant/restaurant.enum';
import { RestaurantReviewDTO } from '@domain/restaurant/dto/restaurant.dto';
import { RestaurantService } from '@domain/restaurant/service/restaurant.service';
import { RestaurantModule } from '@domain/restaurant/restaurant.module';

describe('restaurant service', () => {
  let prisma: PrismaService;
  let module: TestingModule;
  let service: RestaurantService;
  beforeAll(async () => {
    module = (await appModuleFixture(
      [],
      [],
      [RestaurantModule],
    )) as TestingModule;
    prisma = module.get(PrismaService);
    service = module.get(RestaurantService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, ['restaurant_reviews']);
  });

  it('should create data', async () => {
    const dto: RestaurantReviewDTO = {
      category: RestaurantCategory.ASIAN,
      keywords: ['clean'],
      price: 10_000,
      summary: 'never come again',
    };
    const userId = 1;
    const externalRestaurantInformationId = 1;
    await service.registerReview({
      userId,
      externalRestaurantInformationId,
      dto,
    });
    const res = await service.getReviews(1);

    expect(res).toHaveLength(1);
  });
});
