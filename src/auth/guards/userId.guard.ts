import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class UserIdMatchGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Nem található felhasználó a tokenben. Győződjön meg róla, hogy a JwtGuard alkalmazva van.');
    }

    if (user.isAdmin) {
      return true;
    }

    const paramId = request.params.id; 
    if (Number(paramId) !== user.user_id) {
      throw new UnauthorizedException('A felhasználói azonosító nem egyezik.');
    }

    return true;
  }
}
