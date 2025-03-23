import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class UserIdMatchGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('No user found in token payload. Ensure JwtGuard is applied first.');
    }

    if (user.isAdmin) {
      return true;
    }

    const paramId = request.params.id; 
    if (Number(paramId) !== user.user_id) {
      throw new UnauthorizedException('User ID mismatch.');
    }

    return true;
  }
}
