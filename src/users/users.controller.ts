import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { AdminDto } from './dto/change-admin.dto';
import { GetUserQueryDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // @UseGuards( AdminGuard)
  @Get()
  
 async findAll(    @Query() query: GetUserQueryDto
 ) {
    return this.usersService.findAll(query);
  }


  @UseGuards(JwtGuard, AdminGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }


  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,

  ) {

    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Get(':id/bmi')
  async getBMI(@Param('id') id: string) {
    return this.usersService.getBMI(+id);
  }


  @UseGuards(JwtGuard, AdminGuard)
  @Patch(':id/admin')
  async changeAdmin(@Param('id') id: string, @Body() adminDto: AdminDto) {
    return this.usersService.changeAdmin(+id, adminDto);
  }
}
  