import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthenticationService {
  async createProgressAuthentication(category: string, identification: string) {
    console.log(category, identification);
    // check already authenticated
    // check in progress authentication
    // create six digit code
    // register progress state to database with six digit code
    // send email with six digit code
    // return database id
  }

  async doneProgressAuthentication(
    authenticationId: string,
    digitCode: string,
  ) {
    console.log(authenticationId, digitCode);
    // check digit code from database
    // if wrong, throw error
    // if correct, change progress
  }
}
