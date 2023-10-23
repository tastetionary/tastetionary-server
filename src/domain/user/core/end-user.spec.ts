import { EndUser } from '@domain/user/core/end-user';
import { AreaCategory } from '@domain/user/user.enum';
import { userEntityFactory } from '@root/jest.setup';

describe('end-user', () => {
  it('should return empty data', () => {
    const userId = 999;
    const tempUser = userEntityFactory(userId);
    const user = new EndUser(tempUser);
    expect(user.activityArea).toEqual(undefined);
  });
  it('should return area data', () => {
    const userId = 999;
    const tempUser = userEntityFactory(userId);
    const area = {
      id: 1,
      userId,
      category: AreaCategory.ACTIVITY_AREA,
      order: 1,
      address: 'address',
      latitude: 1,
      longitude: 1,
    };

    const user = new EndUser(tempUser, { areas: [area] });
    expect(user.activityArea).toEqual(area);
  });

  it('should return same user id', () => {
    const userId = 999;
    const tempUser = userEntityFactory(userId);
    const user = new EndUser(tempUser);
    expect(user.id).toBe(userId);
  });
});
