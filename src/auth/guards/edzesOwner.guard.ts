import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    NotFoundException,
  } from '@nestjs/common';
  import { EdzesService } from '../../edzes/edzes.service';
  import { Request } from 'express';
  
  @Injectable()
  export class EdzesOwnerGuard implements CanActivate {
    constructor(private readonly edzesService: EdzesService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      const user = request.user; 
      const edzesId = +request.params.id;
  
      if (!user) {
        throw new UnauthorizedException(
          'No user found in token payload. Ensure JwtGuard is applied first.',
        );
      }
  
      
      const edzes = await this.edzesService.findOne(edzesId);
      if (!edzes) {
        throw new NotFoundException(`Edzés with ID ${edzesId} not found`);
      }
  
      
      if (edzes.user_id !== user.user_id) {
        throw new UnauthorizedException('User is not the owner of this edzés');
      }
  

      return true;
    }
  }
  