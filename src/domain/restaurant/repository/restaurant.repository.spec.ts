import { truncateTables } from '@root/jest.setup';
import { loadFixture } from '@root/test/utils/db-test-helper';
import {
  getExternalRestaurantIdsByDistance,
  getExternalRestaurantInformation,
  getExternalRestaurantInformationById,
  getReportOptionRecord,
  getRestaurantOptionsRecord,
  getReviewById,
  getReviewReportById,
  getReviewsByConditions,
  getReviewsByUserId,
  getReviewsOrderedByCreatedTime,
  getUserReviewCount,
  saveExternalRestaurantInformation,
  saveReview,
  saveReviewReport,
  saveReviewReports,
  updateReviewById,
} from '@domain/restaurant/repository/restaurant.repository';
import {
  RestaurantCategory,
  RestaurantPrice,
  ReviewReportCategory,
} from '@domain/restaurant/restaurant.enum';
import prismaClient from '@root/src/common/database/prisma';

describe('Restaurant repository', () => {
  beforeEach(async () => {
    await truncateTables(prismaClient, [
      'restaurant_reviews',
      'external_restaurant_informations',
      'review_reports',
    ]);
  });

  describe('getReviewsByConditions - by category', () => {
    beforeEach(async () => {
      await loadFixture(
        prismaClient,
        'test/fixtures/restaurant/review-by-category.sql',
      );
    });

    it('should return restaurants by category', async () => {
      const res = await getReviewsByConditions({
        categories: [RestaurantCategory.ASIAN],
      });
      expect(res).toHaveLength(1);
    });
  });

  describe('getReviewsByConditions - by price', () => {
    beforeEach(async () => {
      await loadFixture(
        prismaClient,
        'test/fixtures/restaurant/review-by-price.sql',
      );
    });

    it('should return restaurants by price', async () => {
      const res = await getReviewsByConditions({
        keywords: [],
        prices: [RestaurantPrice.UNDER_13000, RestaurantPrice.UNDER_20000],
      });
      expect(res).toHaveLength(1);

      const wrongRes = await getReviewsByConditions({
        keywords: [],
        prices: [RestaurantPrice.OVER_20000, RestaurantPrice.UNDER_16000],
      });
      expect(wrongRes).toHaveLength(0);
    });
  });

  describe('getReviewsByConditions - by keyword', () => {
    beforeEach(async () => {
      await loadFixture(
        prismaClient,
        'test/fixtures/restaurant/review-by-keyword.sql',
      );
    });

    it('should return restaurants by keywords', async () => {
      const cleanRes = await getReviewsByConditions({
        keywords: ['clean'],
        prices: [RestaurantPrice.UNDER_10000],
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
  });

  describe('getExternalRestaurantIdsByDistance', () => {
    beforeEach(async () => {
      await loadFixture(
        prismaClient,
        'test/fixtures/restaurant/external-info-distance.sql',
      );
    });

    it('should return restaurants by condition', async () => {
      const latitude = 37.517331925853;
      const longitude = 127.047377408384;

      const res = await getExternalRestaurantIdsByDistance({
        latitude,
        longitude,
        maxDistanceMeter: 1000,
      });
      const ids = res.map((r) => r.externalUUID);
      expect(ids).toEqual([1000n, 1001n]);
    });
  });

  describe('getExternalRestaurantInformationById', () => {
    beforeEach(async () => {
      await loadFixture(
        prismaClient,
        'test/fixtures/restaurant/external-info-by-id.sql',
      );
    });

    it('should return restaurants by id', async () => {
      const res = await getExternalRestaurantInformationById(1);
      expect(res).not.toBeNull();
      expect(res?.id).toBe(1n);
    });
  });

  describe('getReviewsOrderedByCreatedTime', () => {
    beforeEach(async () => {
      await loadFixture(
        prismaClient,
        'test/fixtures/restaurant/review-ordered.sql',
      );
    });

    it('should return review order by created time', async () => {
      const count = 3;
      const res = await getReviewsOrderedByCreatedTime(count);
      expect(res).not.toBeNull();
      expect(res).toHaveLength(2);
      expect(res[0].external_restaurant_information_id).toEqual(2n);
    });
  });

  describe('updateReviewById', () => {
    beforeEach(async () => {
      await loadFixture(
        prismaClient,
        'test/fixtures/restaurant/review-update.sql',
      );
    });

    it('should update review', async () => {
      const reviews = await getReviewsByUserId(1);
      expect(reviews).toHaveLength(1);

      const updateData = {
        reviewId: reviews[0].id,
        userId: 1,
        keywords: ['clean', 'kind'],
        category: RestaurantCategory.BUFFET,
        prices: [RestaurantPrice.UNDER_16000],
        summary: 'updated summary',
        opinion: 'Y',
        externalRestaurantInformationId: 1n,
      };

      await updateReviewById(updateData);

      const updatedReview = await getReviewById(reviews[0].id);
      expect(updatedReview).not.toBeNull();
      expect(updatedReview?.category).toBe(RestaurantCategory.BUFFET);
      expect(updatedReview?.summary).toBe('updated summary');
      expect(updatedReview?.opinion).toBe('Y');
      expect(updatedReview?.keywords).toEqual(['clean', 'kind']);
      expect(updatedReview?.prices).toEqual([RestaurantPrice.UNDER_16000]);
    });
  });

  it('should throw error when updating non-existent review', async () => {
    const updateData = {
      reviewId: 99999,
      userId: 1,
      keywords: ['clean'],
      category: RestaurantCategory.ASIAN,
      prices: [RestaurantPrice.UNDER_10000],
      summary: 'test',
      opinion: 'Y',
      externalRestaurantInformationId: 1n,
    };
    await expect(updateReviewById(updateData)).rejects.toThrow();
  });

  it('should save external info', async () => {
    const data = {
      externalUUID: 1n,
      name: 'test',
      location: { latitude: 1, longitude: 1 },
      referenceLink: 'https://www.naver.com',
      address: 'test',
      phone: '010-1234-5678',
    };
    await saveExternalRestaurantInformation(data);
    const res = await getExternalRestaurantInformation(data.externalUUID);
    expect(res).not.toBeNull();
    expect(res?.external_uuid).toBe(data.externalUUID);
    expect(res?.address).toBe(data.address);
    expect(res?.phone).toBe(data.phone);
    expect(res?.reference_link).toBe(data.referenceLink);
  });

  it('should save external info without address', async () => {
    const data = {
      externalUUID: 1n,
      name: 'test',
      location: { latitude: 1, longitude: 1 },
      referenceLink: 'https://www.naver.com',
      phone: '010-1234-5678',
    };
    await saveExternalRestaurantInformation(data);
    const res = await getExternalRestaurantInformation(data.externalUUID);
    expect(res).not.toBeNull();
    expect(res?.external_uuid).toBe(data.externalUUID);
    expect(res?.address).toBe('');
    expect(res?.phone).toBe(data.phone);
    expect(res?.reference_link).toBe(data.referenceLink);
  });

  it('should save external info without phone number', async () => {
    const data = {
      externalUUID: 1n,
      name: 'test',
      location: { latitude: 1, longitude: 1 },
      referenceLink: 'https://www.naver.com',
      address: 'test',
    };
    await saveExternalRestaurantInformation(data);
    const res = await getExternalRestaurantInformation(data.externalUUID);
    expect(res).not.toBeNull();
    expect(res?.external_uuid).toBe(data.externalUUID);
    expect(res?.address).toBe(data.address);
    expect(res?.phone).toBe('00-0000-0000');
    expect(res?.reference_link).toBe(data.referenceLink);
  });

  it('should save external info without address and phone', async () => {
    const data = {
      externalUUID: 1n,
      name: 'test',
      location: { latitude: 1, longitude: 1 },
      referenceLink: 'https://www.naver.com',
    };
    await saveExternalRestaurantInformation(data);
    const res = await getExternalRestaurantInformation(data.externalUUID);
    expect(res).not.toBeNull();
    expect(res?.external_uuid).toBe(data.externalUUID);
    expect(res?.address).toBe('');
    expect(res?.phone).toBe('00-0000-0000');
    expect(res?.reference_link).toBe(data.referenceLink);
  });

  it('should save review', async () => {
    const data = {
      userId: 1,
      keywords: ['clean'],
      category: RestaurantCategory.ASIAN,
      prices: [
        RestaurantPrice.UNDER_10000,
        RestaurantPrice.UNDER_13000,
        RestaurantPrice.UNDER_10000,
      ],
      summary: 'never come again',
      opinion: 'no',
      externalRestaurantInformationId: 1n,
    };
    await saveReview(data);
    const res = await getReviewsByUserId(data.userId);
    expect(res).toHaveLength(1);
    const count = await getUserReviewCount(data.userId);
    expect(count).toBe(1);
  });

  it('should get restaurant options', async () => {
    const res = await getRestaurantOptionsRecord();
    const expected = {
      categories: [
        { id: 0, name: '전체', icon: 'menu_all' },
        { id: 1, name: '한식', icon: 'menu_korean' },
        { id: 2, name: '중식', icon: 'menu_chinese' },
        { id: 3, name: '양식', icon: 'menu_western' },
        { id: 4, name: '일식', icon: 'menu_japanese' },
        { id: 5, name: '패스트푸드', icon: 'menu_fastfood' },
        { id: 6, name: '분식', icon: 'menu_snack' },
        { id: 7, name: '아시아식', icon: 'menu_asian' },
        { id: 8, name: '뷔페', icon: 'menu_buffet' },
        { id: 9, name: '샐러드', icon: 'menu_salad' },
        { id: 10, name: '카페/디저트', icon: 'menu_cafedessert' },
      ],
      keywords: [
        { id: 0, name: '전체' },
        { id: 1, name: '맛있어요👅' },
        { id: 2, name: '깨끗해요✨' },
        { id: 3, name: '친절해요💕' },
        { id: 4, name: '분위기 좋아요🍷' },
        { id: 5, name: '가성비 좋아요👍' },
        { id: 6, name: '주차 가능해요🚘' },
        { id: 7, name: '회전율 좋아요⏩' },
        { id: 8, name: '양이 많아요🥰' },
        { id: 9, name: '넓고 쾌적해요🎶' },
        { id: 10, name: '웨이팅 있어요💦' },
      ],
      prices: [
        { id: 0, name: '10,000원 미만' },
        { id: 1, name: '10,000원 이상 ~ 13,000원 미만' },
        { id: 2, name: '13,000원 이상 ~ 16,000원 미만' },
        { id: 3, name: '16,000원 이상 ~ 20,000원 미만' },
        { id: 4, name: '20,000원 이상' },
      ],
    };
    expect(res).toEqual(expected);
  });

  it('should get review report options', async () => {
    const res = await getReportOptionRecord();
    const expected = [
      { id: 0, key: 'WRONG_ADDRESS', label: '가게 주소가 달라요.' },
      { id: 1, key: 'WRONG_PRICE', label: '음식 가격대가 달라요.' },
      { id: 2, key: 'STRANGE_PHOTO', label: '가게 사진이 이상해요.' },
      { id: 3, key: 'STORE_CLOSED', label: '가게가 폐업했어요.' },
      { id: 4, key: 'ETC', label: '기타 다른 신고 사항이 있어요.' },
    ];
    expect(res).toEqual(expected);
  });

  it('should save review report', async () => {
    const data = {
      userId: 1,
      reviewId: 1,
      category: ReviewReportCategory.ETC,
      content: 'test-content',
    };
    await saveReviewReport(data);
    const res = await getReviewReportById(data.reviewId);
    expect(res).not.toBeNull();
  });

  it('should save review reports', async () => {
    const data = [
      {
        userId: 1,
        reviewId: 1,
        category: ReviewReportCategory.STORE_CLOSED,
        content: 'test-content',
      },
    ];
    await saveReviewReports(data);
    const res = await getReviewReportById(data[0].reviewId);
    expect(res).not.toBeNull();
  });
});
