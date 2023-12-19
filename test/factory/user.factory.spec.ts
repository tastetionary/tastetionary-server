import {
  areaEntityFactory,
  authEntityFactory,
  userEntityFactory,
} from './user.factory';

describe('user factory', () => {
  it('userEntityFactory should return entity and differ entity', () => {
    const entity = userEntityFactory();
    const entity2 = userEntityFactory();

    expect(entity.id).not.toEqual(entity2.id);
  });

  it('authEntityFactory should return data', () => {
    const res = authEntityFactory({ userId: 1 });
    expect(res).toHaveProperty('company');
    expect(res).toHaveProperty('account');
  });

  it('areaEntityFactory should return data', () => {
    const res = areaEntityFactory({ userId: 1 });
    expect(res).toHaveProperty('diningArea');
    expect(res).toHaveProperty('activityArea');
  });
});
