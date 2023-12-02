import prismaClient from '@common/database/new.prisma';

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

export async function deleteToken(id: number) {
  return prismaClient.userTokens.delete({ where: { id } });
}
