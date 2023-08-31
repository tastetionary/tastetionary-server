import { Injectable } from '@nestjs/common';
import { UserRepository } from '@domain/user/repository/user.repository';

@Injectable()
export class UserService {
  constructor(private userRepo: UserRepository) {}

  async createUsers(param: {
    nickname: string;
    state: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    property: Record<string, any>;
  }) {
    return this.userRepo.saveUser(param);
  }
}
