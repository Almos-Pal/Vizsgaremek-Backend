import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { EdzesService } from '../../edzes/edzes.service';
import { Request } from 'express';

@Injectable()
export class EdzesOwnerGuard implements CanActivate {
  constructor(private readonly edzesService: EdzesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    
    if (!user) {
      throw new UnauthorizedException(
        'Nem található felhasználó a tokenben. Győződjön meg róla, hogy a JwtGuard először alkalmazva lett.'
      );
    }

    if (user.isAdmin) {
      return true;
    }

    const routeEdzesId = request.params.id;
    const routeUserId = request.params.userId;

    if (routeEdzesId) {
      const edzesId = +routeEdzesId;
      const edzes = await this.edzesService.findOne(edzesId);
      if (!edzes) {
        throw new NotFoundException(`Nem található edzés a következő azonosítóval: ${edzesId}`);
      }
      if (edzes.user_id !== user.user_id) {
        throw new ForbiddenException('A felhasználó nem az edzés tulajdonosa');
      }
      return true;
    } else if (routeUserId) {
      if (+routeUserId !== user.user_id) {
        throw new ForbiddenException('A felhasználó nem jogosult megtekinteni ezeket az edzéseket');
      }
      return true;
    }

    const queryUser = request.query.userId || request.query.user_id;
    if (queryUser) {
      if (+queryUser !== user.user_id) {
        throw new ForbiddenException('A felhasználó nem jogosult megtekinteni ezeket az edzéseket');
      }
      return true;
    } else {
 
      throw new ForbiddenException('Csak adminok érhetik el az összes edzést.');
    }
  }
}
