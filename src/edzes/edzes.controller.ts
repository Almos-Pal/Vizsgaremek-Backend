import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
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

@ApiTags('Edzes')
@Controller('edzes')
export class EdzesController {
  constructor(private readonly edzesService: EdzesService) {}


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
    type: 'string'})
    @ApiQuery({
      name: 'type',
      description: 'típus megadás, hogy milyen időintervallumot szeretnénk lekérni',
      required: false,
      type: "week|month|halfyear|all"})
  @ApiResponse({ 
    status: 200, 
    description: 'Az edzések sikeresen lekérve',
    type: Edzes
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Az edzések nem találhatóak' 
  })
  findManyByDate(@Query()query:GetEdzesekQueryDto, @Query('startDate') startDate?:string,@Query('endDate') endDate?:string,@Query("type")type?:"week"|"month"|"halfyear"|"all") {

    return this.edzesService.findManyByDate(startDate,endDate,query,type);
  }
  


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
    return this.edzesService.getEdzesIzomcsoportok( userId );
  }
  
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
    type: 'string'})
  @ApiResponse({ 
    status: 200, 
    description: 'Az edzés sikeresen lekérve',
    type: Edzes
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Az edzés nem található' 
  })
  findOneByDate(@Query('userId') userId:number, @Query('date') date:string) {

    return this.edzesService.findOneByDate(userId,date);
  }
  

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
}
