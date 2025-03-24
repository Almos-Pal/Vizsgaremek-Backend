import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { EdzesService } from './edzes.service';
import { CreateEdzesDto } from './dto/create-edzes.dto';
import { UpdateEdzesDto } from './dto/update-edzes.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Edzes } from './entities/edzes.entity';
import { AddEdzesGyakorlatDto } from './dto/add-edzes-gyakorlat.dto';
import { AddEdzesGyakorlatSetDto } from './dto/add-edzes-gyakorlat-set.dto';
import { UpdateEdzesSetDto } from './dto/update-edzes-set.dto';
import { GetEdzesekQueryDto } from './dto/get-edzesek.dto';
import { EdzesekResponseDto } from './dto/edzesek-response.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { UserIdMatchGuard } from 'src/auth/guards/userId.guard';
import { EdzesOwnerGuard } from 'src/auth/guards/edzesOwner.guard';
import { CreateEdzesOwnerGuard } from 'src/auth/guards/createEdzes.guard';

@ApiTags('Edzes')
@Controller('edzes')
export class EdzesController {
  constructor(private readonly edzesService: EdzesService) { }

  @UseGuards(JwtGuard)
  @Get('ten')
  @ApiOperation({
    summary: 'A legutóbbi 10 edzés',
    description: 'Lekéri a legutóbbi 10 edzés a hozzájuk tartozó gyakorlatokkal és izomcsoportokkal együtt'
  })
  @ApiQuery({
    name: 'userId',
    description: 'A felhasználó azonosítója',
    required: true,
    type: 'number'
  })
  @ApiQuery({
    name: 'gyakorlat',
    description: 'A gyakorlat id-ja',
    required: true,
    type: 'number'
  })
  @ApiQuery({
    name: 'isTemplate',
    description: 'Sablon-e az edzés',
    required: false,
    type: 'boolean'
  })
  findTen(
    @Query('userId') userId: number,
    @Query('gyakorlat') gyakorlat: number,
    @Query('isTemplate') isTemplate?: boolean
  ) {
    return this.edzesService.findTen(userId, gyakorlat, isTemplate);
  }

 
  @UseGuards(JwtGuard, EdzesOwnerGuard)
  @Get('intervallum')
  @ApiOperation({
    summary: 'Egy user adott intervallumon belüli edzései',
    description: 'Lekér egy intervallumban lévő edzéseket a user azonosítója és, egy kezdő és végző dátumon, vagy kiválasztott típus intervallumon belül, a gyakorlatokkal és izomcsoportokkal együtt'
  })
  @ApiQuery({
    name: 'startDate',
    description: 'A kezdő dátum',
    required: false,
    type: 'string'
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Az végző dátuma',
    required: false,
    type: 'string'
  })
  @ApiQuery({
    name: 'type',
    description: 'típus megadás, hogy milyen időintervallumot szeretnénk lekérni',
    required: false,
    type: "week|month|halfyear|all"
  })
  @ApiQuery({
    name: 'isTemplate',
    description: 'Sablon-e az edzés',
    required: false,
    type: 'boolean'
  })
  @ApiResponse({
    status: 200,
    description: 'Az edzések sikeresen lekérve',
    type: Edzes
  })
  @ApiResponse({
    status: 404,
    description: 'Az edzések nem találhatóak'
  })
  findManyByDate(@Query() query: GetEdzesekQueryDto) {

    return this.edzesService.findManyByDate(query);
  }

  @UseGuards(JwtGuard, CreateEdzesOwnerGuard)
  @Post()
  @ApiOperation({
    summary: 'Új edzés létrehozása',
    description: 'Létrehoz egy új edzést a megadott felhasználóhoz'
  })
  @ApiResponse({
    status: 201,
    description: 'Az edzés sikeresen létrehozva',
    type: Edzes
  })
  @ApiResponse({
    status: 404,
    description: 'A felhasználó nem található'
  })
  create(@Body() createEdzesDto: CreateEdzesDto) {
    return this.edzesService.create(createEdzesDto);
  }

  @UseGuards(JwtGuard, EdzesOwnerGuard)
  @Post(':id/gyakorlat/:userId')
  @ApiOperation({
    summary: 'Gyakorlat hozzáadása edzéshez',
    description: 'Hozzáad egy gyakorlatot egy meglévő edzéshez és rögzíti a felhasználó történetében'
  })
  @ApiParam({
    name: 'id',
    description: 'Az edzés azonosítója',
    type: 'number'
  })
  @ApiParam({
    name: 'userId',
    description: 'A felhasználó azonosítója',
    type: 'number'
  })
  @ApiResponse({
    status: 201,
    description: 'A gyakorlat sikeresen hozzáadva',
    type: Edzes
  })
  @ApiResponse({
    status: 404,
    description: 'Az edzés vagy a gyakorlat nem található'
  })
  addGyakorlatToEdzes(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() gyakorlatDto: AddEdzesGyakorlatDto
  ) {
    return this.edzesService.addGyakorlatToEdzes(id, userId, gyakorlatDto);
  }

  @UseGuards(JwtGuard, EdzesOwnerGuard)
  @Delete(':id/gyakorlat/:gyakorlatId/:userId')
  @ApiOperation({
    summary: 'Gyakorlat törlése edzésből',
    description: 'Törli a gyakorlatot az edzésből és a felhasználó történetéből'
  })
  @ApiParam({
    name: 'id',
    description: 'Az edzés azonosítója',
    type: 'number'
  })
  @ApiParam({
    name: 'gyakorlatId',
    description: 'A gyakorlat azonosítója',
    type: 'number'
  })
  @ApiParam({
    name: 'userId',
    description: 'A felhasználó azonosítója',
    type: 'number'
  })
  
  deleteGyakorlatFromEdzes(
    @Param('id', ParseIntPipe) id: number,
    @Param('gyakorlatId', ParseIntPipe) gyakorlatId: number,
    @Param('userId', ParseIntPipe) userId: number
  ) {
      return this.edzesService.deleteGyakorlatFromEdzes(id, gyakorlatId, userId)
  }

  @UseGuards(JwtGuard, EdzesOwnerGuard)
  @Post(':id/gyakorlat/:gyakorlatId/set/:userId')
  @ApiOperation({
    summary: 'Szett hozzáadása gyakorlathoz',
    description: 'Hozzáad egy szettet egy edzés gyakorlatához és rögzíti a felhasználó történetében'
  })
  @ApiParam({
    name: 'id',
    description: 'Az edzés azonosítója',
    type: 'number'
  })
  @ApiParam({
    name: 'gyakorlatId',
    description: 'A gyakorlat azonosítója',
    type: 'number'
  })
  @ApiParam({
    name: 'userId',
    description: 'A felhasználó azonosítója',
    type: 'number'
  })
  @ApiResponse({
    status: 201,
    description: 'A szett sikeresen hozzáadva',
    type: Edzes
  })
  @ApiResponse({
    status: 404,
    description: 'Az edzés, a gyakorlat vagy a felhasználó nem található'
  })
  addSetToEdzesGyakorlat(
    @Param('id', ParseIntPipe) id: number,
    @Param('gyakorlatId', ParseIntPipe) gyakorlatId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() setDto: AddEdzesGyakorlatSetDto
  ) {
    return this.edzesService.addSetToEdzesGyakorlat(id, userId, gyakorlatId, setDto);
  }

  @UseGuards(JwtGuard, EdzesOwnerGuard)
  @Patch(':id/gyakorlat/:gyakorlatId/set/:setId/:userId')
  @ApiOperation({
    summary: 'Szett módosítása',
    description: 'Módosítja egy edzés gyakorlatának szettjét'
  })
  @ApiParam({
    name: 'id',
    description: 'Az edzés azonosítója',
    type: 'number'
  })
  @ApiParam({
    name: 'gyakorlatId',
    description: 'A gyakorlat azonosítója',
    type: 'number'
  })
  @ApiParam({
    name: 'setId',
    description: 'A szett azonosítója',
    type: 'number'
  })
  @ApiParam({
    name: 'userId',
    description: 'A felhasználó azonosítója',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'A szett sikeresen módosítva',
    type: Edzes
  })
  @ApiResponse({
    status: 404,
    description: 'Az edzés, a gyakorlat vagy a szett nem található'
  })
  updateSet(
    @Param('id', ParseIntPipe) id: number,
    @Param('gyakorlatId', ParseIntPipe) gyakorlatId: number,
    @Param('setId', ParseIntPipe) setId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateDto: UpdateEdzesSetDto
  ) {
    return this.edzesService.updateSet(id, userId, gyakorlatId, setId, updateDto);
  }

  @UseGuards(JwtGuard, EdzesOwnerGuard) 
  @Delete(':id/gyakorlat/:gyakorlatId/set/:setId/:userId')
  @ApiOperation({
    summary: 'Szett törlése',
    description: 'Törli egy edzés gyakorlatának szettjét'
  })
  @ApiParam({
    name: 'id',
    description: 'Az edzés azonosítója',
    type: 'number'
  })
  @ApiParam({
    name: 'gyakorlatId',
    description: 'A gyakorlat azonosítója',
    type: 'number'
  })
  @ApiParam({
    name: 'setId',
    description: 'A szett azonosítója',
    type: 'number'
  })
  @ApiParam({
    name: 'userId',
    description: 'A felhasználó azonosítója',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'A szett sikeresen törölve'
  })
  @ApiResponse({
    status: 404,
    description: 'Az edzés, a gyakorlat vagy a szett nem található'
  })
  removeSet(
    @Param('id', ParseIntPipe) id: number,
    @Param('gyakorlatId', ParseIntPipe) gyakorlatId: number,
    @Param('setId', ParseIntPipe) setId: number,
    @Param('userId', ParseIntPipe) userId: number
  ) {
    return this.edzesService.removeSet(id, userId, gyakorlatId, setId);
  }

  @UseGuards(JwtGuard, EdzesOwnerGuard)
  @Get()
  @ApiOperation({
    summary: 'Összes edzés lekérése',
    description: 'Lekéri az összes edzést a hozzájuk tartozó gyakorlatokkal és izomcsoportokkal együtt'
  })
  @ApiResponse({
    status: 200,
    description: 'Az edzések sikeresen lekérve',
    type: EdzesekResponseDto
  })
  findAll(@Query() query: GetEdzesekQueryDto) {
    return this.edzesService.findAll(query);
  }

  @UseGuards(JwtGuard)
  @Get('izomcsoportok')
  @ApiOperation({
    summary: 'Edzésekben használt izomcsoportok lekérése',
    description: 'Lekéri az összes izomcsoportot és fő izomcsoportot, ami szerepel az edzésekben'
  })
  @ApiQuery({
    name: 'user_id',
    description: 'A felhasználó azonosítója',
    required: true,
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Az izomcsoportok sikeresen lekérve',
    schema: {
      type: 'object',
      properties: {
        izomcsoportok: {
          type: 'array',
          items: { type: 'number' },
          description: 'Az összes érintett izomcsoport azonosítója'
        },
        fo_izomcsoportok: {
          type: 'array',
          items: { type: 'number' },
          description: 'Az összes érintett fő izomcsoport azonosítója'
        }
      }
    }
  })

  @ApiResponse({
    status: 400,
    description: 'Hibás kérés - Érvénytelen felhasználó azonosító'
  })
  getEdzesIzomcsoportok(@Query('user_id') userId: number) {
    return this.edzesService.getEdzesIzomcsoportok(userId);
  }

  @UseGuards(JwtGuard, EdzesOwnerGuard)
  @Get('napi')
  @ApiOperation({
    summary: 'Egy user adott napi edzésének részletes adatai',
    description: 'Lekér egy edzést a user azonosítója és az edzés dátuma alapján a gyakorlatokkal és izomcsoportokkal együtt'
  })
  @ApiQuery({
    name: 'userId',
    description: 'A felhasználó azonosítója',
    required: true,
    type: 'number'
  })
  @ApiQuery({
    name: 'date',
    description: 'Az edzés dátuma',
    required: true,
    type: 'string'
  })
  @ApiQuery({
    name: 'isTemplate',
    description: 'Sablon-e az edzés',
    required: false,
    type: 'boolean'
  })
  @ApiResponse({
    status: 200,
    description: 'Az edzés sikeresen lekérve',
    type: Edzes
  })
  @ApiResponse({
    status: 404,
    description: 'Az edzés nem található'
  })
  findOneByDate(
    @Query('userId') userId: number,
    @Query('date') date: string,
    @Query('isTemplate') isTemplate?: boolean
  ) {
    return this.edzesService.findOneByDate(userId, date, isTemplate);
  }

  @UseGuards(JwtGuard, EdzesOwnerGuard )
  @Get(':id')
  @ApiOperation({
    summary: 'Egy edzés részletes adatai',
    description: 'Lekér egy edzést az azonosítója alapján a gyakorlatokkal és izomcsoportokkal együtt'
  })
  @ApiParam({
    name: 'id',
    description: 'Az edzés azonosítója',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Az edzés sikeresen lekérve',
    type: Edzes
  })
  @ApiResponse({
    status: 404,
    description: 'Az edzés nem található'
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.edzesService.findOne(id);
  }

  @UseGuards(JwtGuard, EdzesOwnerGuard)
  @Patch(':id')
  @ApiOperation({
    summary: 'Edzés módosítása',
    description: 'Módosítja az edzés adatait a megadott azonosító alapján'
  })
  @ApiParam({
    name: 'id',
    description: 'Az edzés azonosítója',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Az edzés sikeresen módosítva',
    type: Edzes
  })
  @ApiResponse({
    status: 404,
    description: 'Az edzés nem található'
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEdzesDto: UpdateEdzesDto) {
    return this.edzesService.update(id, updateEdzesDto);
  }

  @UseGuards(JwtGuard, EdzesOwnerGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Edzés törlése',
    description: 'Törli az edzést és a hozzá tartozó gyakorlatokat'
  })
  @ApiParam({
    name: 'id',
    description: 'Az edzés azonosítója',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Az edzés sikeresen törölve'
  })
  @ApiResponse({
    status: 404,
    description: 'Az edzés nem található'
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.edzesService.remove(id);
  }

  @UseGuards(JwtGuard, EdzesOwnerGuard)
  @Patch(':id/finalize/:userId')
  @ApiOperation({
    summary: 'Edzés véglegesítésének állapotának módosítása',
    description: 'Módosítja az edzés véglegesítésének állapotát a megadott azonosító alapján'
  })
  @ApiParam({
    name: 'id',
    description: 'Az edzés azonosítója',
    type: 'number'
  })
  @ApiParam({
    name: 'userId',
    description: 'A felhasználó azonosítója',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Az edzés véglegesítésének állapota sikeresen módosítva',
    type: Edzes
  })
  @ApiResponse({
    status: 404,
    description: 'Az edzés nem található vagy nem tartozik a megadott felhasználóhoz'
  })
  @ApiResponse({
    status: 400,
    description: 'Hiba történt az edzés állapotának módosítása során'
  })
  changeEdzesFinalizedStatus(
    @Param('id', ParseIntPipe) edzesId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body('finalized') finalized: boolean
  ) {
    return this.edzesService.changeEdzesFinalizedStatus(edzesId, userId, finalized);
  }

  @UseGuards(JwtGuard, CreateEdzesOwnerGuard)
  @Post('template/:templateId/:userId')
  @ApiOperation({
    summary: 'Új edzés létrehozása sablonból',
    description: 'Létrehoz egy új edzést egy meglévő sablon alapján'
  })
  @ApiParam({
    name: 'templateId',
    description: 'A sablon azonosítója',
    type: 'number'
  })
  @ApiParam({
    name: 'userId',
    description: 'A felhasználó azonosítója',
    type: 'number'
  })
  @ApiResponse({
    status: 201,
    description: 'Az edzés sikeresen létrehozva a sablonból',
    type: Edzes
  })
  @ApiResponse({
    status: 404,
    description: 'A sablon vagy a felhasználó nem található'
  })
  @ApiResponse({
    status: 409,
    description: 'Az adott napon már létezik edzés'
  })
  createFromTemplate(
    @Param('templateId', ParseIntPipe) templateId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body("date") date?: string
  ) {
    return this.edzesService.createEdzesFromTemplate(templateId, userId,date);
  }

  @UseGuards(JwtGuard, EdzesOwnerGuard)
  @Get('current-week/:userId')
  @ApiOperation({
    summary: 'Aktuális heti edzések lekérése',
    description: 'Lekéri az aktuális hét összes edzését és a hozzájuk tartozó izomcsoportokat'
  })
  @ApiParam({
    name: 'userId',
    description: 'A felhasználó azonosítója',
    type: 'number'
  })
  @ApiQuery({
    name: 'isTemplate',
    description: 'Sablon-e az edzés',
    required: false,
    type: 'boolean'
  })
  @ApiResponse({
    status: 200,
    description: 'Az edzések sikeresen lekérve',
    schema: {
      type: 'object',
      properties: {
        edzesek: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/Edzes' // Használjuk a $ref-et
          },
          description: 'A hét edzései'
        },
        izomcsoportok: {
          type: 'array',
          items: { type: 'number' },
          description: 'Az érintett izomcsoportok azonosítói'
        },
        fo_izomcsoportok: {
          type: 'array',
          items: { type: 'number' },
          description: 'Az érintett fő izomcsoportok azonosítói'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Hibás kérés'
  })
  getCurrentWeekEdzesek(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('isTemplate') isTemplate?: boolean
  ) {
    return this.edzesService.getCurrentWeekEdzesek(userId, isTemplate);
  }
}
