import { searchProfile } from '@domain/user/service/user.service';

export async function getProfile(userId: number) {
  return searchProfile(userId);
}
