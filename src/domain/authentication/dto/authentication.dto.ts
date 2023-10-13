import { AuthenticationType } from '@domain/authentication/authentication.enum';

export interface CreateAuthenticationRequest {
  /**
   * unique identification for authentication, such as test@gmail.com
   * @type string
   */
  identification: string;

  /**
   * authentication type, such as email
   * @type AuthenticationType
   */
  type: AuthenticationType;
}

export interface CreateAuthenticationResponse {
  /**
   * authentication history id
   * @type number
   */
  id: number;

  /**
   * authentication expire time
   * @type Date
   */
  expiredAt: Date;
}
