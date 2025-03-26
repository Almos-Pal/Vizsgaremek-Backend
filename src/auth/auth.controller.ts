import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { RefreshJwtGuard } from './guards/refresh.guard';
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { UserDto, UserLogiResponsenDto } from 'src/users/dto/user.dto';

@ApiTags('Authentikáció')
@Controller('auth')
export class AuthController {
    constructor(private readonly usersService: UsersService,
        private readonly authService: AuthService
    ) { }

    @ApiOperation({
        summary: 'Regisztráció',
        description: 'Új felhasználó regisztrálása. Az email címnek egyedinek kell lennie. A jelszónak minimum 8 karakter hosszúnak kell lennie, legalább egy kis és nagy betűvel, illetve egy speciális karakterrel.'
    })
    @ApiResponse({
        status: 400,
        description: 'Hibás adatok'
    })
    @ApiResponse({
        status: 409,
        description: 'Az email cím már használatban van'
    })
    @ApiResponse({
        status: 201,
        description: 'Sikeres regisztráció',
        type: UserDto
    })
    @ApiBody({
        description: 'Felhasználó regisztráció adatai',
        schema: {
            example: {
                username: 'exampleUser',
                password: 'Example123.',
                email: 'example@example.com'
            }
        }
    })
    @Post('register')
    async registerUser(@Body() createUserDto: CreateUserDto) {
        return await this.usersService.create(createUserDto);
    }

    @ApiOperation({
        summary: 'Bejelentkezés',
        description: 'Felhasználó bejelentkezése'
    })
    @ApiResponse({
        status: 401,
        description: 'Hibás felhasználónév vagy jelszó'
    })
    @ApiResponse({
        status: 200,
        description: 'Sikeres bejelentkezés',
        type: UserLogiResponsenDto
    })
    @ApiBody({
        description: 'Felhasználó bejelentkezési adatai',
        schema: {
            example: {
                email: 'example@example.com',
                password: 'Example123.'
            }
        }
    })
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return await this.authService.login(loginDto);
    }


    @ApiOperation({
        summary: 'Token frissítése',
        description: 'Access token frissítése, ha a access token lejárt.'
    })
    @ApiResponse({
        status: 401,
        description: 'Nincs jogosultság a hozzáféréshez'
    })
    @ApiResponse({
        status: 200,
        description: 'Sikeres token frissítés',
    })
    @ApiSecurity('access-token')
    @UseGuards(RefreshJwtGuard)
    @Post('refresh')
    async refreshToken(@Request() req) {
        return await this.authService.refreshToken(req.user);

    }
}
