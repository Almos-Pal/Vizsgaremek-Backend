import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/auth.dto';
import { UsersService } from 'src/users/users.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';


const EXPIRE_TIME = 24 * 60 * 60 * 1000;
@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }


    async login(loginDto: LoginDto) {

        const user = await this.validateUser(loginDto);
        const payload = {
            email: user.email,
            isAdmin: user.isAdmin,
            user_id: user.user_id,
            sub: {
                username: user.username,
            }
        }

        return {
            user,
            backendTokens: {
                accessToken: await this.jwtService.signAsync(payload, {
                    expiresIn: '1d',
                    secret: process.env.JWT_SECRET,
                    algorithm: 'HS256',
                }),
                refreshToken: await this.jwtService.signAsync(payload, {
                    expiresIn: '7d',
                    secret: process.env.JWT_REFRESH_TOKEN_KEY,
                    algorithm: 'HS256',
                }),
                expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
            }
        }
    }

    async validateUser(loginDto: LoginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);

        if (user && (await compare(loginDto.password, user.password))) {
            const { password,  ...result } = user;
            return result;
        }

        throw new UnauthorizedException('Invalid credentials');
    }


    async refreshToken(user: any) {
        const payload = {
            email: user.email,
            isAdmin: user.isAdmin,
            sub: user.sub
        }

        return {
            accessToken: await this.jwtService.signAsync(payload, {
                expiresIn: '1h',
                secret: process.env.JWT_SECRET,
                algorithm: 'HS256',
            }),
            refreshToken: await this.jwtService.signAsync(payload, {
                expiresIn: '7d',
                secret: process.env.JWT_REFRESH_TOKEN_KEY,
                algorithm: 'HS256',
            }),
            expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
        }
    }
}
