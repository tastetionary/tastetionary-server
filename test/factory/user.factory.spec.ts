import {
  activityAreaFactory,
  dinningAreaFactory,
  userFactory,
} from './user.factory';

describe('user factory', () => {
  it('user factory should return data', () => {
    const user = userFactory();
    expect(user).not.toBeNull();
    expect(user.id).not.toBeNull();
  });

  it('area factory should return data', () => {
    const diningArea = dinningAreaFactory(1);
    expect(diningArea).not.toBeNull();

    const activityArea = activityAreaFactory(1);
    expect(activityArea).not.toBeNull();
  });
});
