export interface CreateAuthenticationRequest {
  /**
   * unique identification for authentication, such as email
   * @type string
   */
  identification: string;
}

export interface CreateAuthenticationResponse {
  /**
   * authentication progress id
   * @type string
   */
  id: string;
}
