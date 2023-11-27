import {
  AuthenticationCategory,
  AuthenticationState,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import { AuthenticationRecord } from '@domain/authentication/repository/authentication.repository';

export class UserAuth {
  readonly userId: number | null;
  readonly authentications: AuthenticationRecord[];
  constructor(userId: number | null, records: AuthenticationRecord[]) {
    this.userId = userId;
    this.authentications = records;
  }

  getAuth(identification: string, category: AuthenticationCategory) {
    return this.authentications.find(
      (history) =>
        history.identification === identification &&
        history.category === category,
    );
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
