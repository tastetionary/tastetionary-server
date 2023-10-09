import {
  AuthenticationState,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import { AuthenticationEntity } from '@domain/authentication/repository/authentication.repository';

export class UserAuth {
  readonly userId: number;
  readonly authentications: AuthenticationEntity[];
  constructor(userId: number, records: AuthenticationEntity[]) {
    this.userId = userId;
    this.authentications = records;
  }

  isInProgress(type = AuthenticationType.EMAIL) {
    const record = this.authentications.find(
      (history) => history.type === type,
    );
    if (!record) {
      return false;
    }
    return record.state === AuthenticationState.INPROGRESS;
  }
}
