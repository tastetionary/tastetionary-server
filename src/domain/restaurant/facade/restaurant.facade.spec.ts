import { areaEntityFactory } from '@root/test/factory/user.factory';
import {
  getFilterOptions,
  registerReview,
} from '@domain/restaurant/facade/restaurant.facade';
import * as userService from '@domain/user/service/user.service';
import { CallerWrongDomainRuleException } from '@common/exception/internal.exception';

describe('facade', () => {
  describe('registerReview', () => {
    it('with not register activity_area, should not register review', async () => {
      const userId = 99;
      const entity = areaEntityFactory({ userId });
      entity.activityArea = undefined;
      jest.spyOn(userService, 'searchAreas').mockResolvedValueOnce(entity);

      await expect(
        registerReview({
          userId,
          externalDto: '' as any,
          dto: '' as any,
        }),
      ).rejects.toThrowError(CallerWrongDomainRuleException);
    });
  });

  describe('getFilterOptions', () => {
    it('getFilterOptions should return data', () => {
      const res = getFilterOptions();
      expect(res).toHaveProperty('categories');
      expect(res).toHaveProperty('keywords');
      expect(res).toHaveProperty('prices');
    });
  });
});
