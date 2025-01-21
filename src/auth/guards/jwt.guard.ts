import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Observable } from "rxjs";


@Injectable()
export class JwtGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}


    async canActivate(context: ExecutionContext):Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException('Unauthorized access');
        }
        
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET
            });
            
            request['user'] = payload;
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Token has expired');
            } else if (error.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('Invalid token');
            }
            throw new UnauthorizedException('Unauthorized access');
        }

        return true;
    }


      private extractTokenFromHeader(request: Request): string | undefined {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return undefined;
        }
        const [type, token] = authHeader.split(' ');
        return type === 'Bearer' ? token : undefined;
    }
}