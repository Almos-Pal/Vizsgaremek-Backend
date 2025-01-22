import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { RefreshJwtGuard } from './guards/refresh.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly usersService: UsersService,
        private readonly authService: AuthService
    ) {}


    @Post('register')
    async registerUser(@Body() createUserDto: CreateUserDto) {
        return await this.usersService.create(createUserDto);
    }

    @Post('login')
    async login(@Body() createUserDto: LoginDto) {
       return await this.authService.login(createUserDto);
    }

    @UseGuards(RefreshJwtGuard)
    @Post('refresh') 
    async refreshToken(@Request() req) {
        return await this.authService.refreshToken(req.user);

    }
}
