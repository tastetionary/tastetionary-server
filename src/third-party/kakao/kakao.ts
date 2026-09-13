import axios from 'axios';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { SocialLoginInfo } from '@root/src/domain/account/dto/account.dto';
import { summarizeHttpError } from '@common/logging/redact';

const logger = new Logger('KakaoOAuth');

export async function getKakaoUserInfo(code: string) {
  const kakaoUserInfoUrl = 'https://kapi.kakao.com/v2/user/me';
  const accessToken = await getAccessToken(code);
  try {
    const userInfoResponse = await axios.get(kakaoUserInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const res: SocialLoginInfo = {
      email: userInfoResponse.data.kakao_account.email,
      id: userInfoResponse.data.id,
      gender: userInfoResponse.data.kakao_account.gender,
    };

    return res;
  } catch (error) {
    logger.warn({
      message: 'failed to fetch kakao user info',
      ...summarizeHttpError(error),
    });
    throw new UnauthorizedException('Failed to fetch user info from Kakao');
  }
}

async function getAccessToken(code: string) {
  const tokenUrl = 'https://kauth.kakao.com/oauth/token';
  const data = {
    grant_type: 'authorization_code',
    client_id: process.env.KAKAO_CLIENT_ID,
    code: code,
  };

  try {
    const response = await axios.post(tokenUrl, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data.access_token;
  } catch (error) {
    logger.warn({
      message: 'failed to get kakao access token',
      ...summarizeHttpError(error),
    });
    throw new UnauthorizedException('Failed to fetch access token from Kakao');
  }
}
