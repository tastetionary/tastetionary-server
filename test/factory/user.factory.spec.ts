import { activityAreaFactory, dinningAreaFactory } from './user.factory';

describe('user factory', () => {
  it('area factory should return data', () => {
    const diningArea = dinningAreaFactory(1);
    expect(diningArea).not.toBeNull();

    const activityArea = activityAreaFactory(1);
    expect(activityArea).not.toBeNull();
  });
});
