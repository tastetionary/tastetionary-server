import { transformer, UserEntity } from './lab';

describe('lab', () => {
  it('temp', () => {
    const user = { id: 1, nickname: '', state: '' };
    const areaUser = transformer<UserEntity, 'area'>(user, (user) => {
      return {
        ...user,
        type: 'area',
        area: {
          id: 1,
        },
      };
    });

    const authUser = transformer<UserEntity, 'auth'>(user, (user) => {
      return {
        ...user,
        type: 'auth',
        auth: {
          id: 1,
        },
      };
    });

    const profileUser = transformer<UserEntity, 'profile'>(user, (user) => {
      return {
        ...user,
        type: 'profile',
        profile: {
          gender: 'MALE',
        },
      };
    });
  });
});
