import prismaClient from '@root/src/common/database/prisma';

export async function saveToken(param: {
  userId: number;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiredAt: Date;
  refreshTokenExpiredAt: Date;
}) {
  return await prismaClient.userTokens.create({ data: param });
}

export async function getTokenByUserId(userId: number) {
  return prismaClient.userTokens.findFirst({
    where: { userId },
  });
}

export async function deleteTokensByUserId(userId: number) {
  return prismaClient.userTokens.deleteMany({ where: { userId } });
}
