import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { PrismaService } from '@common/database/prisma.service';
import { RestaurantCategory } from '@domain/restaurant/restaurant.enum';
import { ExternalRestaurantInformationDTO } from '@domain/restaurant/dto/restaurant.dto';
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
    await truncateTables(prisma, [
      'restaurant_reviews',
      'external_restaurant_informations',
    ]);
  });

  it('with new restaurant, should save or update', async () => {
    const data = {
      externalUUID: 9378928n,
      name: 'some',
      latitude: 1,
      longitude: 1,
      referenceLink: 'https://www.naver.com',
    };

    await service.registerExternalRestaurantInformationWhenNoData(data);
    const res = await service.getExternalRestaurant(data.externalUUID);
    expect(res).not.toBeNull();
  });

  it('should create review data and external data', async () => {
    const dto = {
      category: RestaurantCategory.ASIAN,
      keywords: ['clean'],
      price: 10_000,
      summary: 'never come again',
    };
    const externalDto: ExternalRestaurantInformationDTO = {
      externalUUID: 123123n,
      name: 'some',
      latitude: 1,
      longitude: 1,
      referenceLink: 'https://www.naver.com',
    };
    const userId = 1;
    await service.registerReview({
      userId,
      externalDto,
      dto,
    });
    const res = await service.getReviews(1);

    expect(res).toHaveLength(1);
  });
});
