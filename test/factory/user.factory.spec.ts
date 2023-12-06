import {
  activityAreaFactory,
  dinningAreaFactory,
  userEntityFactory,
  userRecordFactory,
} from './user.factory';

describe('user factory', () => {
  it('user entity factory should return entity and differ entity', () => {
    const entity = userEntityFactory();
    const entity2 = userEntityFactory();

    expect(entity.id).not.toEqual(entity2.id);
  });

  it('user factory should return data', () => {
    const user = userRecordFactory();
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
