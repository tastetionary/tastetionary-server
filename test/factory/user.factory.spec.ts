import { areaEntityFactory, userEntityFactory } from './user.factory';

describe('user factory', () => {
  it('user entity factory should return entity and differ entity', () => {
    const entity = userEntityFactory();
    const entity2 = userEntityFactory();

    expect(entity.id).not.toEqual(entity2.id);
  });

  it('area factory should return data', () => {
    const res = areaEntityFactory({ userId: 1 });
    expect(res).toHaveProperty('dinningArea');
    expect(res).toHaveProperty('activityArea');
  });
});
