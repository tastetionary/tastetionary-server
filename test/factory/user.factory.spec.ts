import {
  accountEntityFactory,
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
    expect(res).toHaveProperty('account');
  });

  it('areaEntityFactory should return data', () => {
    const res = areaEntityFactory({ userId: 1 });
    expect(res).toHaveProperty('id');
    expect(res).toHaveProperty('latitude');
    expect(res).toHaveProperty('longitude');
  });

  it('accountEntityFactory should return data', () => {
    const res = accountEntityFactory({ userId: 1 });
    expect(res).toHaveProperty('id');
    expect(res).toHaveProperty('identification');
    expect(res).toHaveProperty('password');
  });
});
