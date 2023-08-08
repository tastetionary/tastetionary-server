import { appService } from '@root/jest.setup';

describe('app service', () => {
  beforeEach(async () => {});

  describe('configuration', () => {
    it('should temp', () => {
      const res = appService.getHello();
      console.log(res);
      expect(appService.getHello()).not.toBeNull();
    });
  });
});
