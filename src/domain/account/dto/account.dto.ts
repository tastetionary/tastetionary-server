import { AccountCategory } from '@domain/account/account.enum';
import { DoneProgressRequest } from '@domain/authentication/dto/authentication.dto';

export interface ResetPasswordRequest extends DoneProgressRequest {}

export interface CreateAccountRequest {
  /**
   * authentication id which is done
   * @type number
   */
  authenticationId: number;

  /**
   * unique identification for accounts, such as email
   * @type string
   */
  identification: string;

  /**
   * password for accounts, it should be one-way encrypted
   * @type string
   */
  password: string;

  /**
   * category for accounts, now only support 'EMAIL'
   * @type string
   */
  category: AccountCategory;
}

export interface CreateTokenRequest {
  /**
   * unique identification for accounts, such as email
   * @type string
   */
  identification?: string;

  /**
   * password for accounts, it should be one-way encrypted
   * @type string
   */
  password?: string;

  /**
   * category for accounts, now only support 'EMAIL'
   * @type string
   */
  category: AccountCategory;

  /**
   * authorization code for social login
   * @type string
   */
  code?: string;
}

export interface TokenDTO {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiredAt: Date;
  refreshTokenExpiredAt: Date;
}
