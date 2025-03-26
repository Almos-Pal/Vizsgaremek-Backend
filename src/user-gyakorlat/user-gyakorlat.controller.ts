import { Controller, Get, Post, Body, Param, Delete, Query, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiSecurity } from '@nestjs/swagger';
import { UserGyakorlatService } from './user-gyakorlat.service';
import { CreateUserGyakorlatDto } from './dto/create-user-gyakorlat.dto';
import { CreateUserGyakorlatHistoryDto } from './dto/create-user-gyakorlat-history.dto';
import { UserGyakorlat } from './entities/user-gyakorlat.entity';
import { GetUserGyakorlatokQueryDto, UserGyakorlatokResponseDto } from './dto/user-gyakorlatok.dto';
import { UserGyakorlatNotFoundDto } from '../common/dto/not-found.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@ApiTags('User Gyakorlat')
@ApiSecurity('access-token')
@Controller('user-gyakorlat')
export class UserGyakorlatController {
  constructor(private readonly userGyakorlatService: UserGyakorlatService) { }

  @UseGuards(JwtGuard)
  @Post()
  @ApiOperation({
    summary: 'Új user-gyakorlat kapcsolat létrehozása',
    description: 'Létrehoz egy új kapcsolatot a felhasználó és egy gyakorlat között'
  })
  @ApiResponse({
    status: 201,
    description: 'A kapcsolat sikeresen létrehozva',
    type: UserGyakorlat
  })
  @ApiResponse({
    status: 400,
    description: 'A gyakorlat már hozzá van rendelve a felhasználóhoz'
  })
  @ApiResponse({
    status: 404,
    description: 'A gyakorlat vagy a felhasználó nem található'
  })
  @ApiResponse({
    status: 401,
    description: 'Nincs jogosultság a hozzáféréshez'
  })
  create(@Body() createUserGyakorlatDto: CreateUserGyakorlatDto) {
    return this.userGyakorlatService.createUserGyakorlat(createUserGyakorlatDto);
  }

  @UseGuards(JwtGuard)
  @Post('history')
  @ApiOperation({
    summary: 'Új edzés history bejegyzés létrehozása',
    description: 'Rögzít egy új edzés eredményt (súly és ismétlésszám) egy gyakorlathoz'
  })
  @ApiResponse({
    status: 201,
    description: 'A history bejegyzés sikeresen létrehozva',
    type: UserGyakorlat
  })
  @ApiResponse({
    status: 401,
    description: 'Nincs jogosultság a hozzáféréshez'
  })
  createHistory(@Body() createHistoryDto: CreateUserGyakorlatHistoryDto) {
    return this.userGyakorlatService.createUserGyakorlatHistory(createHistoryDto);
  }

  @UseGuards(JwtGuard)
  @Get('user/:userId')
  @ApiOperation({
    summary: 'Felhasználó összes gyakorlatának lekérése',
    description: 'Lekéri az összes gyakorlatot és azok történetét egy adott felhasználóhoz'
  })
  @ApiParam({
    name: 'userId',
    description: 'A felhasználó azonosítója',
    type: 'number',
    required: true
  })
  @ApiResponse({
    status: 200,
    description: 'A gyakorlatok sikeresen lekérve',
    type: UserGyakorlatokResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Nincs jogosultság a hozzáféréshez'
  })
  getUserGyakorlatok(
    @Param('userId') userId: string,
    @Query() query: GetUserGyakorlatokQueryDto
  ) {
    return this.userGyakorlatService.getUserGyakorlatok(+userId, query);
  }

  @UseGuards(JwtGuard)
  @Get(':userId/:gyakorlatId')
  @ApiOperation({
    summary: 'Egy konkrét user-gyakorlat részletes adatai',
    description: 'Lekéri egy konkrét gyakorlat részletes adatait és történetét egy felhasználóhoz'
  })
  @ApiParam({
    name: 'userId',
    description: 'A felhasználó azonosítója',
    type: 'number',
    required: true
  })
  @ApiParam({
    name: 'gyakorlatId',
    description: 'A gyakorlat azonosítója',
    type: 'number',
    required: true
  })
  @ApiResponse({
    status: 200,
    description: 'A gyakorlat adatai sikeresen lekérve',
    type: UserGyakorlat
  })
  @ApiResponse({
    status: 404,
    description: 'A gyakorlat nem található a felhasználónál',
    type: UserGyakorlatNotFoundDto
  })
  @ApiResponse({
    status: 401,
    description: 'Nincs jogosultság a hozzáféréshez'
  })
  getUserGyakorlatDetails(
    @Param('userId') userId: string,
    @Param('gyakorlatId') gyakorlatId: string,
  ) {
    return this.userGyakorlatService.getUserGyakorlatDetails(+userId, +gyakorlatId);
  }

  @UseGuards(JwtGuard)
  @Delete(':userId/:gyakorlatId')
  @ApiOperation({
    summary: 'Felhasználó gyakorlatának törlése',
    description: 'Törli a kapcsolatot egy felhasználó és egy gyakorlat között'
  })
  @ApiParam({
    name: 'userId',
    description: 'A felhasználó azonosítója',
    type: 'number',
    required: true
  })
  @ApiParam({
    name: 'gyakorlatId',
    description: 'A gyakorlat azonosítója',
    type: 'number',
    required: true
  })
  @ApiResponse({
    status: 200,
    description: 'A gyakorlat sikeresen törölve',
    type: UserGyakorlat
  })
  @ApiResponse({
    status: 404,
    description: 'A gyakorlat nem található a felhasználónál',
    type: UserGyakorlatNotFoundDto
  })
  @ApiResponse({
    status: 401,
    description: 'Nincs jogosultság a hozzáféréshez'
  })
  deleteUserGyakorlat(
    @Param('userId') userId: string,
    @Param('gyakorlatId') gyakorlatId: string,
  ) {
    return this.userGyakorlatService.deleteUserGyakorlat(+userId, +gyakorlatId);
  }



} 