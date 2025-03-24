import { Controller, Get, Patch, Param, Delete, UseGuards, Body, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { AdminDto } from './dto/change-admin.dto';
import { GetUserQueryDto, UserResponseDto } from './dto/user.dto';
import { UserIdMatchGuard } from 'src/auth/guards/userId.guard';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto'

@ApiTags('Users')
@ApiSecurity('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtGuard, AdminGuard)
  @Get()
  @ApiOperation({
    summary: 'Összes felhasználó lekérdezése',
    description: 'Az összes felhasználó lekérdezése, csak admin jogosultsággal érhető el'
  })
  @ApiResponse({
    status: 200,
    description: 'Sikeres lekérdezés, összes felhasználó visszaadva.',
    type: UserResponseDto,
    examples: {
      example: {
        summary: 'Visszatérési példa',
        value: {
          items: [
            {
              user_id: 37,
              username: 'Admin',
              email: 'admin@gmail.com',
              suly: null,
              magassag: null,
              isAdmin: true
            }
          ],
          meta: {
            currentPage: 1,
            itemsPerPage: 1,
            totalItems: 7,
            totalPages: 7
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid Token' })
  @ApiResponse({ status: 403, description: 'Hozzáférés megtagadva - csak Adminok' })
  async findAll(@Query() query: GetUserQueryDto): Promise<UserResponseDto> {
    return this.usersService.findAll(query);
  }

  @UseGuards(JwtGuard, UserIdMatchGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Egy felhasználó lekérdezése',
    description:
      'Egy felhasználó lekérdezése azonosító alapján. Egy felhasználó csak a saját adatait érheti el, míg admin jogosultsággal az összes felhasználó adatai lekérdezhetőek.'
  })
  @ApiResponse({
    status: 200,
    description: 'Felhasználó adatai visszaadva.',
    type: UserDto,
    examples: {
      example: {
        summary: 'Visszatérési példa',
        value: {
          user_id: 37,
          username: 'Admin',
          email: 'admin@gmail.com',
          suly: null,
          magassag: null,
          isAdmin: true
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @UseGuards(JwtGuard, UserIdMatchGuard)
  @Patch(':id')
  @ApiOperation({
    summary: 'Felhasználó adatainak módosítása',
    description:
      'Felhasználó adatainak módosítása azonosító alapján. Egy felhasználó csak a saját adatait módosíthatja, míg admin jogosultsággal az összes felhasználó módosítható.'
  })
  @ApiResponse({
    status: 200,
    description: 'Felhasználó adatai sikeresen módosítva.',
    type: UserDto,
    examples: {
      example: {
        summary: 'Visszatérési példa',
        value: {
          user_id: 37,
          username: 'Admin',
          email: 'admin@gmail.com',
          suly: 70,
          magassag: 175,
          isAdmin: true
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Felhasználó törlése',
    description: 'Felhasználó törlése azonosító alapján. Csak admin jogosultsággal érhető el.'
  })
  @ApiResponse({
    status: 200,
    description: 'Felhasználó sikeresen törölve.',
    schema: {
      example: { message: 'User and all related data successfully deleted' }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Hozzáférés megtagadva - csak Adminok' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @UseGuards(JwtGuard, UserIdMatchGuard)
  @Get(':id/bmi')
  @ApiOperation({
    summary: 'BMI kiszámítása',
    description:
      'BMI kiszámítása felhasználó azonosító alapján. Egy felhasználó csak a saját BMI-jét kérdezheti le, míg admin jogosultsággal az összes felhasználó BMI-je lekérdezhető.'
  })
  @ApiResponse({
    status: 200,
    description: 'BMI kiszámítása sikeres.',
    schema: {
      example: { bmi: '22.50', type: 'Normál' }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBMI(@Param('id') id: string) {
    return this.usersService.getBMI(+id);
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Patch(':id/admin')
  @ApiOperation({
    summary: 'Admin jogosultság módosítása',
    description: 'Admin jogosultság módosítása felhasználó azonosító alapján. Csak admin jogosultsággal érhető el.'
  })
  @ApiResponse({
    status: 200,
    description: 'Admin státusz sikeresen megváltoztatva.',
    schema: {
      example: { message: 'Admin státusz sikeresen megváltoztatva' }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Hozzáférés megtagadva - csak Adminok' })
  async changeAdmin(@Param('id') id: string, @Body() adminDto: AdminDto) {
    return this.usersService.changeAdmin(+id, adminDto);
  }
}
