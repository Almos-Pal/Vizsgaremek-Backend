import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    if (user && user.isAdmin) {
      return true;
    }
    console.log('user.isAdmin:', user ? user : 'undefined');
    throw new ForbiddenException('Access denied - Admins only');
  }
}
