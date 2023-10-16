import {
  AuthenticationCategory,
  AuthenticationState,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import { AuthenticationEntity } from '@domain/authentication/repository/authentication.repository';

export class UserAuth {
  readonly userId: number | null;
  readonly authentications: AuthenticationEntity[];
  constructor(userId: number | null, records: AuthenticationEntity[]) {
    this.userId = userId;
    this.authentications = records;
  }

  isInProgress(category: AuthenticationCategory, type: AuthenticationType) {
    const record = this.authentications.find(
      (history) => history.category === category && history.type === type,
    );
    if (!record) {
      return false;
    }
    return record.state === AuthenticationState.INPROGRESS;
  }

  isDone(category: AuthenticationCategory, type: AuthenticationType) {
    const record = this.authentications.find(
      (history) => history.category === category && history.type === type,
    );
    if (!record) {
      return false;
    }
    return record.state === AuthenticationState.DONE;
  }
}
