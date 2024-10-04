import axios from 'axios';
import { UnauthorizedException } from '@nestjs/common';

// https://developers.naver.com/docs/login/profile/profile.md
export async function getNaverUserInfo(token: string) {
  const naverUserInfoUrl = 'https://openapi.naver.com/v1/nid/me';

  try {
    const userInfoResponse = await axios.get(naverUserInfoUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Naver user info:', userInfoResponse.data);
    return userInfoResponse.data;
  } catch (error) {
    console.error(
      'Error fetching Naver user info:',
      error.response ? error.response.data : error.message,
    );
    throw new UnauthorizedException('Failed to fetch user info from Naver');
  }
}
