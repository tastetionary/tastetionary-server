import { PrismaService } from '@common/database/prisma.service';
import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { RestaurantRepository } from '@domain/restaurant/repository/restaurant.repository';
import { RestaurantCategory } from '@domain/restaurant/restaurant.enum';

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

  it('should return restaurants by category', async () => {
    const data = [
      {
        userId: 1,
        keywords: ['clean', 'good', 'test', 'abc'],
        category: RestaurantCategory.ASIAN,
        price: 10_000,
        summary: 'never come again',
        opinion: 'no',
        externalRestaurantInformationId: 1n,
      },
    ];

    await repo.saveReview(data[0]);

    const res = await repo.getReviewsByConditions({
      categories: [RestaurantCategory.ASIAN],
    });
    expect(res).toHaveLength(1);
  });

  it('should return restaurants by keywords', async () => {
    const data = [
      {
        userId: 1,
        keywords: ['clean', 'good', 'test', 'abc'],
        category: RestaurantCategory.ASIAN,
        price: 10_000,
        summary: 'never come again',
        opinion: 'no',
        externalRestaurantInformationId: 1n,
      },
    ];

    await repo.saveReview(data[0]);

    const res = await repo.getReviewsByConditions({
      keywords: [],
      ltePrice: 12_000,
    });
    expect(res).toHaveLength(1);

    const wrongRes = await repo.getReviewsByConditions({
      keywords: [],
      ltePrice: 9_000,
    });
    expect(wrongRes).toHaveLength(0);
  });

  it('should return restaurants by keywords', async () => {
    const data = [
      {
        userId: 1,
        keywords: ['clean', 'good', 'test', 'abc'],
        category: RestaurantCategory.ASIAN,
        price: 10_000,
        summary: 'never come again',
        opinion: 'no',
        externalRestaurantInformationId: 1n,
      },
    ];

    await repo.saveReview(data[0]);

    const cleanRes = await repo.getReviewsByConditions({
      keywords: ['clean'],
    });
    expect(cleanRes).toHaveLength(1);

    const onlyOneRes = await repo.getReviewsByConditions({
      keywords: ['clean', 'never'],
    });
    expect(onlyOneRes).toHaveLength(1);

    const nothingRes = await repo.getReviewsByConditions({
      keywords: ['nothing'],
    });
    expect(nothingRes).toHaveLength(0);

    const allRes = await repo.getReviewsByConditions({});
    expect(allRes).toHaveLength(1);
  });

  it('should return restaurants by condition', async () => {
    const latitude = 37.517331925853;
    const longitude = 127.047377408384;

    const data = [
      {
        externalUUID: 1000n,
        name: 'test',
        location: {
          latitude,
          longitude,
        },
        referenceLink: 'https://www.naver.com',
      },
      {
        externalUUID: 1001n,
        name: 'test',
        location: {
          latitude,
          longitude,
        },
        referenceLink: 'https://www.naver.com',
      },
    ];
    await repo.saveExternalRestaurantInformations(data);
    const res = await repo.getExternalRestaurantIdsByDistance({
      latitude,
      longitude,
      maxDistanceOnMeter: 1000,
    });
    console.log(res);
    const ids = res.map((r) => r.externalUUID);
    expect(ids).toEqual([1000n, 1001n]);
  });

  it('should save external info', async () => {
    const data = {
      externalUUID: 1n,
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
        category: RestaurantCategory.ASIAN,
        price: 10_000,
        summary: 'never come again',
        opinion: 'no',
        externalRestaurantInformationId: 1n,
      },
    ];

    await repo.saveReview(data[0]);

    const res = await repo.getReviewsByUserId(data[0].userId);
    expect(res).toHaveLength(1);
  });
});
