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

  describe('checkNickNameValidity', () => {
    const check = (nickname: string) =>
      pipe(
        checkNickNameValidity(nickname),
        TE.getOrElse<Error, boolean>((error) => {
          throw error;
        }),
      )();

    beforeEach(async () => {
      await truncateTables(prismaClient, ['banned_words']);
      await prismaClient.bannedWords.createMany({
        data: [{ word: 'banned' }, { word: '금칙어' }],
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return false if nickname contains a banned word', async () => {
      expect(await check('myBANNEDnick')).toBe(false);
      expect(await check('맛있는금칙어')).toBe(false);
    });

    it('should return false if nickname is similar to a banned word', async () => {
      expect(await check('bannned')).toBe(false);
    });

    it('should return true if nickname is only a part of a banned word', async () => {
      expect(await check('nne')).toBe(true);
    });

    it('should return true if there is no banned word', async () => {
      expect(await check('맛있는고양이')).toBe(true);
      expect(await check('nickname')).toBe(true);
    });

    it('should return left with cause if the query fails', async () => {
      const cause = new Error('function similarity(text, text) does not exist');
      jest.spyOn(prismaClient, '$queryRaw').mockRejectedValue(cause);

      const res = await checkNickNameValidity('nickname')();

      expect(res).toEqualLeft(
        expect.objectContaining({
          message: 'failed to check banned words',
          cause,
        }),
      );
    });
  });
});
