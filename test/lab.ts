interface User {
  id: number;
  nickname: string;
  state: string;
}

interface areaUser extends User {
  type: 'area';
  area: {
    id: number;
  };
}

interface authUser extends User {
  type: 'auth';
  auth: {
    id: number;
  };
}

interface profile {
  gender: 'MALE' | 'FEMALE';
}

interface profileUser extends User {
  type: 'profile';
  profile: profile;
}

export type UserEntity = User | areaUser | authUser | profileUser;

type ExtractType<T extends { type: any }> = T['type'];
type userEntityTypes = ExtractType<areaUser | authUser | profileUser>;

export function transformer<
  T extends UserEntity,
  typeWord extends userEntityTypes,
>(user: T, func: (user: T) => Extract<UserEntity, { type: typeWord }>) {
  return func(user);
}
