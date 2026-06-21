import { truncateTables } from '@root/jest.setup';
import { loadFixture } from '@root/test/utils/db-test-helper';
import { UserState, WithdrawalTypeEnum } from '@domain/user/user.enum';
import prismaClient from '@root/src/common/database/prisma';
import {
  getOpinionsByUserId,
  getUsers,
  saveOpinion,
  saveUser,
  saveUsers,
  updateUserById,
  checkNickNameValidity,
} from '@domain/user/repository/user.repository';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { error } from 'console';

describe('user repository', () => {
  beforeEach(async () => {
    await truncateTables(prismaClient, ['users', 'user_opinions']);
  });

  it('should save opinions', async () => {
    const data = {
      userId: 99,
      category: 'withdrawal' as const,
      types: [
        WithdrawalTypeEnum.FOUND_SIMILAR_SERVICE,
        WithdrawalTypeEnum.INCONVENIENT_USAGE,
      ],
      opinion: 'kk',
    };

    await saveOpinion(data);

    const res = await getOpinionsByUserId({ userIds: [data.userId] });
    expect(res.length).toEqual(1);
  });

  describe('updateUserById', () => {
    beforeEach(async () => {
      await loadFixture(prismaClient, 'test/fixtures/user/user-update.sql');
    });

    it('should update user', async () => {
      const user = (await getUsers({}))[0];
      const updateData = { nickname: 'test2', state: 'test2' };
      await updateUserById(user.id, updateData);

      const updatedUser = (await getUsers({}))[0];
      expect(updatedUser.nickname).toEqual(updateData.nickname);
      expect(updatedUser.state).toEqual(updateData.state);
    });
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

  it('should return false if there is banned word', async () => {
    prismaClient.bannedWords.findMany = jest
      .fn()
      .mockResolvedValue([{ word: 'banned' }]);
    const res = await pipe(
      checkNickNameValidity('banned nickname'),
      TE.match(
        (error) => {
          console.log(error);
          throw error;
        },
        (success: boolean) => success,
      ),
    )();
    expect(res).toBe(false);
  });

  it('should return false if word has similiarity', async () => {
    prismaClient.bannedWords.findMany = jest.fn().mockResolvedValue([]);
    prismaClient.$queryRaw = jest
      .fn()
      .mockResolvedValue(['similar banned word']);
    const res = await pipe(
      checkNickNameValidity('invalid nickname'),
      TE.match(
        (error) => {
          console.log(error);
          throw error;
        },
        (success: boolean) => success,
      ),
    )();
    expect(res).toBe(false);
  });

  it('should return true if there is no banned word', async () => {
    prismaClient.bannedWords.findMany = jest.fn().mockResolvedValue([]);
    prismaClient.$queryRaw = jest.fn().mockResolvedValue([]);

    const res = await pipe(
      checkNickNameValidity('valid nickname'),
      TE.match(
        (error) => {
          console.log(error);
          throw error;
        },
        (success: boolean) => success,
      ),
    )();

    expect(res).toBe(true);
  });
});
