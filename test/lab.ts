interface User {
  id: number;
  nickname: string;
  state: string;
}

interface AreaUser extends User {
  type: 'area';
  area: {
    id: number;
  };
}

interface AuthUser extends User {
  type: 'auth';
  auth: {
    id: number;
  };
}

interface UserProfile extends User {
  type: 'profile';
  profile: {
    gender: string;
  };
}

export type UserEntity = User | AreaUser | AuthUser | UserProfile;

type ExtractType<T extends { type: any }> = T['type'];
type AllUserTypes = ExtractType<AreaUser | AuthUser | UserProfile>;

export function transformer<T, typeWord extends AllUserTypes>(
  user: T,
  func: (user: T) => Extract<UserEntity, { type: typeWord }>,
) {
  return func(user);
}
