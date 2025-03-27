import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CreateEdzesOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user; 

    if (!user) {
      throw new UnauthorizedException('Nincs felhasználó a tokenben. Győződjön meg róla, hogy a JwtGuard alkalmazva van.');
    }

    const userIdFromBody = request.body?.user_id;
    const userIdFromParams = request.params?.userId ? Number(request.params.userId) : undefined;
    const providedUserId = userIdFromBody ?? userIdFromParams;

    if (providedUserId === undefined) {
      throw new UnauthorizedException('Nincs user_id megadva a kérésben.');
    }

    if (providedUserId !== user.user_id) {
      throw new ForbiddenException('Felhasználói azonosító nem egyezik. Nem hozhat létre edzést másik felhasználó számára.');
    }

    return true;
  }
}
