import axios from 'axios';
import { UnauthorizedException } from '@nestjs/common';

export async function getKakaoUserInfo(code: string) {
  const kakaoUserInfoUrl = 'https://kapi.kakao.com/v2/user/me';

  try {
    const userInfoResponse = await axios.get(kakaoUserInfoUrl, {
      headers: {
        Authorization: `Bearer ${code}`,
      },
    });
    return userInfoResponse.data;
  } catch (error) {
    console.error(
      'Error fetching Kakao user info:',
      error.response ? error.response.data : error.message,
    );
    throw new UnauthorizedException('Failed to fetch user info from Kakao');
  }
}
