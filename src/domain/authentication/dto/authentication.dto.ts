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
}

export interface CreateAccountProgressRequest extends CreateProgressRequest {
  /**
   * authentication category, such as account, company
   * @type AuthenticationCategory
   */
  category: AuthenticationCategory;
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
