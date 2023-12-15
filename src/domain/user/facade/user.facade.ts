import {
  createProfile,
  searchProfile,
} from '@domain/user/service/user.service';
import { RegisterUserDTO } from '@domain/user/dto/user.dto';

export async function getProfile(userId: number) {
  return searchProfile(userId);
}

export async function registerProfile(dto: RegisterUserDTO) {
  return createProfile(dto);
}
