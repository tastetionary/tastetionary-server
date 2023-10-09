import { AuthenticationType } from '@domain/authentication/authentication.enum';

interface AuthenticationHistoryEntity {
  id: number;
  userId: number;
  identification: string;
  type: AuthenticationType;
  code: string;
  expiredAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserAuth {
  readonly userId: number;
  readonly histories: AuthenticationHistoryEntity[];
  constructor(userId: number, records: AuthenticationHistoryEntity[]) {
    this.userId = userId;
    this.histories = records;
  }

  isInProgress(type = AuthenticationType.EMAIL) {
    const history = this.histories.find((history) => history.type === type);
    if (!history) {
      return false;
    }
    return history.expiredAt.getTime() > new Date().getTime();
  }
}
