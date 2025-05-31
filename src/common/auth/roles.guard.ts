import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isAdmin, UserRole } from '@domain/user/user.enum';
import { searchUser } from '@domain/user/service/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.userId) {
      return false;
    }

    const requireAdmin = this.reflector.getAllAndOverride<boolean>(
      'requireAdmin',
      [context.getHandler(), context.getClass()],
    );

    if (!requireAdmin) {
      return true;
    }

    const userData = await searchUser(user.userId);
    if (!userData) {
      return false;
    }

    return isAdmin(userData.role as UserRole);
  }
}
