import { truncateTables } from '@root/jest.setup';
import { UserState, WithdrawalTypeEnum } from '@domain/user/user.enum';
import prismaClient from '@root/src/common/database/prisma';
import {
  getOpinionsByUserId,
  getUsers,
  saveOpinion,
  saveUser,
  saveUsers,
  updateUserById,
} from '@domain/user/repository/user.repository';

describe('user repository', () => {
  beforeEach(async () => {
    await truncateTables(prismaClient, ['users', 'user_opinions']);
  });

  it('should save opinions', async () => {
    const data = {
      userId: 99,
      category: 'withdrawal' as const,
      type: WithdrawalTypeEnum.FOUND_SIMILAR_SERVICE,
      opinion: 'kk',
    };

    await saveOpinion(data);

    const res = await getOpinionsByUserId({ userIds: [data.userId] });
    expect(res.length).toEqual(1);
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
