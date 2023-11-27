import newPrisma from '@common/database/new.prisma';

export async function saveToken(param: {
  userId: number;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiredAt: Date;
  refreshTokenExpiredAt: Date;
}) {
  return await newPrisma.userTokens.create({ data: param });
}

export async function getTokenByUserId(userId: number) {
  return newPrisma.userTokens.findFirst({
    where: { userId },
  });
}

export async function deleteToken(id: number) {
  return newPrisma.userTokens.delete({ where: { id } });
}
