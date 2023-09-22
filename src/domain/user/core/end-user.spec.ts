import { EndUser } from '@domain/user/core/end-user';
import { AreaCategory } from '@domain/user/user.enum';

describe('end-user', () => {
  it('should return empty data', () => {
    const userId = 999;
    const user = new EndUser(userId);
    expect(user.activityArea).toEqual(undefined);
  });
  it('should return area data', () => {
    const userId = 999;
    const area = {
      id: 1,
      userId,
      category: AreaCategory.ACTIVITY_AREA,
      order: 1,
      address: 'address',
    };

    const user = new EndUser(userId, [area]);
    expect(user.activityArea).toEqual(area);
  });

  it('should return same user id', () => {
    const userId = 999;
    const user = new EndUser(userId);
    expect(user.id).toBe(userId);
  });
});
