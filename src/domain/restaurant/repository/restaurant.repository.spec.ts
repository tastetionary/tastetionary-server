import { PrismaService } from '@common/database/prisma.service';
import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { RestaurantRepository } from '@domain/restaurant/repository/restaurant.repository';

describe('Restaurant repository', () => {
  let repo: RestaurantRepository;
  let prisma: PrismaService;
  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [ConfigurationService, PrismaService, RestaurantRepository],
    )) as TestingModule;
    repo = module.get(RestaurantRepository);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, [
      'restaurant_reviews',
      'external_restaurant_informations',
    ]);
  });

  it('should save external info', async () => {
    const data = {
      externalUUID: 1,
      name: 'test',
      location: {
        latitude: 1,
        longitude: 1,
      },
      referenceLink: 'https://www.naver.com',
    };

    await repo.saveExternalRestaurantInformation(data);
    const res = repo.getExternalRestaurantInformation(data.externalUUID);
    expect(res).not.toBeNull();
  });

  it('should save review ', async () => {
    const data = [
      {
        userId: 1,
        keywords: ['clean'],
        category: 'korean_food',
        price: 10_000,
        summary: 'never come again',
        opinion: 'no',
        externalRestaurantInformationId: 1,
      },
    ];

    await repo.saveReview(data[0]);

    const res = await repo.getReviewsByUserId(data[0].userId);
    expect(res).toHaveLength(1);
  });
});
