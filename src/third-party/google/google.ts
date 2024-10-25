import axios from 'axios';
import { UnauthorizedException } from '@nestjs/common';
import { SocialLoginInfo } from '@root/src/domain/account/dto/account.dto';

export async function getGoogleUserInfo(code: string) {
  const accessToken = await getAccessToken(code);
  const googleUserInfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';

  try {
    const userInfoResponse = await axios.get(googleUserInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const res: SocialLoginInfo = {
      email: userInfoResponse.data.email,
      id: userInfoResponse.data.sub,
    };

    return res;
  } catch (error) {
    console.error(
      'Error fetching Google user info:',
      error.response ? error.response.data : error.message,
    );
    throw new UnauthorizedException('Failed to fetch user info from Google');
  }
}

async function getAccessToken(code: string) {
  try {
    const googleTokenUrl = 'https://oauth2.googleapis.com/token';
    const response = await axios.post(googleTokenUrl, {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    return response.data.access_token;
  } catch (error) {
    throw new UnauthorizedException(
      'Failed to get access token from google: ' + error,
    );
  }
}
