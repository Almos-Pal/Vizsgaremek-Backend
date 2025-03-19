import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class UserIdMatchGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    
   
    const paramId = request.params.id; 
    if (!user) {
      throw new UnauthorizedException('No user found in token payload. Ensure JwtGuard is applied first.');
    }

   
    if (Number(paramId) !== user.user_id) {
      throw new UnauthorizedException('User ID mismatch.');
    }

    return true;
  }
}
