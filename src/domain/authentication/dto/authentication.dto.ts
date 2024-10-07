import {
  AuthenticationCategory,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';

export interface DoneProgressRequest {
  /**
   * history id to validate create authentication
   * @type number
   */
  historyId: number;

  /**
   * authentication code for validating
   * @type string
   */
  code: string;
}

export interface CreateProgressRequest {
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

  /**
   * @deprecated
   * authentication category, such as account, optional param
   * @type AuthenticationCategory
   */
  category?: AuthenticationCategory;
}

export interface ReCreateProgressRequest
  extends Omit<CreateProgressRequest, 'category'> {}

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

export interface DoneAuthenticationResponse {
  /**
   * authentication id which is done
   * @type number
   */
  authenticationId: number;
}
