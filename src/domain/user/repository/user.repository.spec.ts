import { truncateTables } from '@root/jest.setup';
import { UserState } from '@domain/user/user.enum';
import newPrisma from '@common/database/new.prisma';
import {
  getUsers,
  saveUser,
  saveUsers,
  updateUserById,
} from '@domain/user/repository/user.repository';

describe('user repository', () => {
  beforeEach(async () => {
    await truncateTables(newPrisma, ['users']);
  });

  it('should update user', async () => {
    const data = { nickname: 'test', state: UserState.ACTIVE, property: {} };
    await saveUser(data);

    let user = (await getUsers({}))[0];
    const updateData = { nickname: 'test2', state: 'test2' };
    await updateUserById(user.id, updateData);

    user = (await getUsers({}))[0];
    expect(user.nickname).toEqual(updateData.nickname);
    expect(user.state).toEqual(updateData.state);
  });

  it('should save user', async () => {
    const data = { nickname: 'test', state: UserState.ACTIVE, property: {} };
    await saveUser(data);
    const res = await getUsers({});
    expect(res.length).toEqual(1);
  });

  it('should save users', async () => {
    const data = [{ nickname: 'test', state: UserState.ACTIVE, property: {} }];
    await saveUsers(data);
    const res = await getUsers({});
    expect(res.length).toEqual(data.length);
  });
});
