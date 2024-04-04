import { truncateTables } from '@root/jest.setup';
import {
  getExternalRestaurantIdsByDistance,
  getExternalRestaurantInformation,
  getRestaurantOptionsRecord,
  getReviewsByConditions,
  getReviewsByUserId,
  saveExternalRestaurantInformation,
  saveExternalRestaurantInformations,
  saveReview,
} from '@domain/restaurant/repository/restaurant.repository';
import { RestaurantCategory } from '@domain/restaurant/restaurant.enum';
import prismaClient from '@root/src/common/database/prisma';

describe('Restaurant repository', () => {
  beforeEach(async () => {
    await truncateTables(prismaClient, [
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

    await saveReview(data[0]);

    const res = await getReviewsByConditions({
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

    await saveReview(data[0]);

    const res = await getReviewsByConditions({
      keywords: [],
      ltePrice: 12_000,
    });
    expect(res).toHaveLength(1);

    const wrongRes = await getReviewsByConditions({
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

    await saveReview(data[0]);

    const cleanRes = await getReviewsByConditions({
      keywords: ['clean'],
    });
    expect(cleanRes).toHaveLength(1);

    const onlyOneRes = await getReviewsByConditions({
      keywords: ['clean', 'never'],
    });
    expect(onlyOneRes).toHaveLength(1);

    const nothingRes = await getReviewsByConditions({
      keywords: ['nothing'],
    });
    expect(nothingRes).toHaveLength(0);

    const allRes = await getReviewsByConditions({});
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
    await saveExternalRestaurantInformations(data);
    const res = await getExternalRestaurantIdsByDistance({
      latitude,
      longitude,
      maxDistanceMeter: 1000,
    });
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

    await saveExternalRestaurantInformation(data);
    const res = getExternalRestaurantInformation(data.externalUUID);
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

    await saveReview(data[0]);

    const res = await getReviewsByUserId(data[0].userId);
    expect(res).toHaveLength(1);
  });

  it('should get restaurant options', async () => {
    const res = await getRestaurantOptionsRecord();
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
          name: '맛있어요👅',
        },
        {
          id: 2,
          name: '깨끗해요✨',
        },
        {
          id: 3,
          name: '친절해요💕',
        },
        {
          id: 4,
          name: '분위기 좋아요🍷',
        },
        {
          id: 5,
          name: '가성비 좋아요👍',
        },
        {
          id: 6,
          name: '주차 가능해요🚘',
        },
        {
          id: 7,
          name: '회전율 좋아요⏩',
        },
        {
          id: 8,
          name: '양이 많아요🥰',
        },
        {
          id: 9,
          name: '넓고 쾌적해요🎶',
        },
        {
          id: 10,
          name: '웨이팅 있어요💦',
        },
      ],
      prices: [
        {
          id: 0,
          name: '~10,000원',
        },
        {
          id: 1,
          name: '~11,000원',
        },
        {
          id: 2,
          name: '~12,000원',
        },
        {
          id: 3,
          name: '~13,000원',
        },
        {
          id: 4,
          name: '13,000원~',
        },
      ],
    };

    expect(res).toEqual(expected);
  });
});
