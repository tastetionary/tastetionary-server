import axios from 'axios';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { SocialLoginInfo } from '@root/src/domain/account/dto/account.dto';
import { summarizeHttpError } from '@common/logging/redact';

const logger = new Logger('KakaoOAuth');

export async function getKakaoUserInfo(code: string, redirectUri?: string) {
  const kakaoUserInfoUrl = 'https://kapi.kakao.com/v2/user/me';
  const accessToken = await getAccessToken(code, redirectUri);
  try {
    const userInfoResponse = await axios.get(kakaoUserInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const kakaoAccount = userInfoResponse.data.kakao_account;
    const res: SocialLoginInfo = {
      email: kakaoAccount?.email,
      emailVerified:
        kakaoAccount?.is_email_valid === true &&
        kakaoAccount?.is_email_verified === true,
      id: String(userInfoResponse.data.id),
      gender: kakaoAccount?.gender,
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

async function getAccessToken(code: string, redirectUri?: string) {
  const tokenUrl = 'https://kauth.kakao.com/oauth/token';
  const clientSecret = process.env.KAKAO_CLIENT_SECRET;
  const data = {
    grant_type: 'authorization_code',
    client_id: process.env.KAKAO_CLIENT_ID,
    redirect_uri: redirectUri ?? process.env.KAKAO_REDIRECT_URI,
    code: code,
    ...(clientSecret && { client_secret: clientSecret }),
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
