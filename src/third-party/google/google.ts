import axios from 'axios';
import { UnauthorizedException } from '@nestjs/common';

export async function getGoogleUserInfo(token: string) {
  const googleUserInfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';

  try {
    const userInfoResponse = await axios.get(googleUserInfoUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return userInfoResponse.data;
  } catch (error) {
    console.error(
      'Error fetching Google user info:',
      error.response ? error.response.data : error.message,
    );
    throw new UnauthorizedException('Failed to fetch user info from Google');
  }
}
