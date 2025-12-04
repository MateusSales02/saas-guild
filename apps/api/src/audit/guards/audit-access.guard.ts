import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AuditAccessGuard implements CanActivate {
  private readonly allowedEmails = [
    'teste@gmail.com',
    'salesmateus463@gmail.com',
  ];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.email) {
      return false;
    }

    return this.allowedEmails.includes(user.email);
  }
}
