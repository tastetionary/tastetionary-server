import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { PrismaService } from '@common/database/prisma.service';
import { RestaurantCategory } from '@domain/restaurant/restaurant.enum';
import { ExternalRestaurantInformationDTO } from '@domain/restaurant/dto/restaurant.dto';
import { RestaurantService } from '@domain/restaurant/service/restaurant.service';
import { RestaurantModule } from '@domain/restaurant/restaurant.module';
import { ServiceException } from '@common/exception/custom.exception';
import { UserModule } from '@domain/user/user.module';

describe('restaurant service', () => {
  let prisma: PrismaService;
  let module: TestingModule;
  let service: RestaurantService;
  beforeAll(async () => {
    module = (await appModuleFixture(
      [],
      [],
      [UserModule, RestaurantModule],
    )) as TestingModule;
    prisma = module.get(PrismaService);
    service = module.get(RestaurantService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, [
      'user_areas',
      'restaurant_reviews',
      'external_restaurant_informations',
    ]);
  });

  const DTO = {
    category: RestaurantCategory.ASIAN,
    keywords: ['clean'],
    price: 10_000,
    summary: 'never come again',
  };
  const EXTERNAL_DTO: ExternalRestaurantInformationDTO = {
    externalUUID: 123123n,
    name: 'some',
    latitude: 1,
    longitude: 1,
    referenceLink: 'https://www.naver.com',
  };

  it('with not register activity_area, should not register review', async () => {
    const userId = 1;
    await expect(
      service.registerReview({
        userId,
        externalDto: EXTERNAL_DTO,
        dto: DTO,
      }),
    ).rejects.toThrowError(new ServiceException('domaine rule error'));
  });

  it('with new restaurant, should save or update', async () => {
    await service.registerExternalRestaurantInformationWhenNoData(EXTERNAL_DTO);
    const res = await service.getExternalRestaurant(EXTERNAL_DTO.externalUUID);
    expect(res).not.toBeNull();
  });

  it('should create review data and external data', async () => {
    const userId = 1;
    await service.registerReview({
      userId,
      externalDto: EXTERNAL_DTO,
      dto: DTO,
    });
    const res = await service.getReviews(1);

    expect(res).toHaveLength(1);
  });
});
