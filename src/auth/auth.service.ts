import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/auth.dto';
import { UsersService } from 'src/users/users.service';
import {compare} from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(private usersService: UsersService) {}


    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto);
    }

    async validateUser(loginDto: LoginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);


        if(user && (await compare(loginDto.password, user.password))) {
            const { password, ...result } = user;
            return result;
        }

        throw new UnauthorizedException('Invalid credentials');
    }
}
