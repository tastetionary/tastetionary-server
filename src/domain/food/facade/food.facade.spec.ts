import { getFilterOptions } from '@domain/food/facade/food.facade';

describe('facade', () => {
  describe('getFilterOptions', () => {
    it('getFilterOptions should return data', () => {
      const res = getFilterOptions();
      expect(res).toHaveProperty('categories');
      expect(res).toHaveProperty('keywords');
    });
  });
});
