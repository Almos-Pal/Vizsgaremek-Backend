import { Controller, Post } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly usersService: UsersService) {}


    @Post('register')
    async registerUser(@Body() createUserDto: CreateUserDto) {
        return await this.usersService.create(createUserDto);
    }
}
