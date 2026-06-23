import axios from 'axios';
import { UnauthorizedException } from '@nestjs/common';
import { SocialLoginInfo } from '@domain/account/dto/account.dto';

// https://developers.naver.com/docs/login/profile/profile.md
export async function getNaverUserInfo(code: string) {
  const naverUserInfoUrl = 'https://openapi.naver.com/v1/nid/me';
  const token = await getAccessToken(code);
  try {
    const userInfoResponse = await axios.get(naverUserInfoUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const res: SocialLoginInfo = {
      email: userInfoResponse.data.response.email,
      id: userInfoResponse.data.response.id,
    };

    return res;
  } catch (error) {
    console.error(
      'Error fetching Naver user info:',
      error.response ? error.response.data : error.message,
    );
    throw new UnauthorizedException('Failed to fetch user info from Naver');
  }
}

async function getAccessToken(code: string) {
  const tokenUrl = 'https://nid.naver.com/oauth2.0/token';
  const data = {
    grant_type: 'authorization_code',
    client_id: process.env.NAVER_CLIENT_ID,
    redirect_uri: process.env.NAVER_REDIRECT_URI,
    client_secret: process.env.NAVER_CLIENT_SECRET,
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
    console.error(
      'Error fetching access token:',
      error.response ? error.response.data : error.message,
    );
    throw new UnauthorizedException('Failed to fetch access token from Kakao');
  }
}
