import { Logger } from '@nestjs/common';

export enum UserEvent {
  SIGNUP = 'USER_SIGNUP',
  LOGIN = 'USER_LOGIN',
  LOGIN_FAILED = 'USER_LOGIN_FAILED',
  LOGOUT = 'USER_LOGOUT',
  PASSWORD_CHANGED = 'USER_PASSWORD_CHANGED',
  PASSWORD_RESET = 'USER_PASSWORD_RESET',
  PROFILE_UPDATED = 'USER_PROFILE_UPDATED',
  WITHDRAWN = 'USER_WITHDRAWN',
}

const logger = new Logger('USER_EVENT');

export function logUserEvent(
  event: UserEvent,
  fields: { userId: number } & Record<string, unknown>,
) {
  logger.log({ message: event, event, ...fields });
}
