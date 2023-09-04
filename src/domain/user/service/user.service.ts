import { Injectable } from '@nestjs/common';
import { UserRepository } from '@domain/user/repository/user.repository';

@Injectable()
export class UserService {
  constructor(private userRepo: UserRepository) {}

  async createUsers() {}
}
