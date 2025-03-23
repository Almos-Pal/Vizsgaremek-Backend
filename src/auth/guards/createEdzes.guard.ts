import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CreateEdzesOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user; 

    if (!user) {
      throw new UnauthorizedException('No user found in token payload. Ensure JwtGuard is applied first.');
    }


    const userIdFromBody = request.body?.user_id;
    const userIdFromParams = request.params?.userId ? Number(request.params.userId) : undefined;
    const providedUserId = userIdFromBody ?? userIdFromParams;

    if (providedUserId === undefined) {
      throw new UnauthorizedException('No user_id provided in the request.');
    }

    if (providedUserId !== user.user_id) {
      throw new UnauthorizedException('User ID mismatch. You cannot create an edzés for another user.');
    }

    return true;
  }
}
