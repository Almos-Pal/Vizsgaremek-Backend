import { Controller, Get, Post, Body, Patch, Param, Delete, Query, NotFoundException, UseGuards } from '@nestjs/common';
import { GyakorlatService } from './gyakorlat.service';
import { CreateGyakorlatDto } from './dto/create-gyakorlat.dto';
import { UpdateGyakorlatDto } from './dto/update-gyakorlat.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Gyakorlat } from './entities/gyakorlat.entity';
import { GyakorlatokResponseDto, GetGyakorlatokQueryDto } from './dto/gyakorlatok.dto';
import { ErrorResponseDto, SuccessResponseDto, GyakorlatNotFoundDto } from '../common/dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@ApiTags('Gyakorlat')
@Controller('gyakorlat')
export class GyakorlatController {
  constructor(private readonly gyakorlatService: GyakorlatService) {}

  @UseGuards(JwtGuard, AdminGuard)
  @Post()
  @ApiOperation({ summary: 'Új gyakorlat létrehozása' })
  @ApiResponse({ 
    status: 201, 
    description: 'A gyakorlat sikeresen létrehozva',
    type: Gyakorlat
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Hibás kérés - Érvénytelen adatok vagy izomcsoport azonosítók',
    type: ErrorResponseDto
  })
  create(@Body() createGyakorlatDto: CreateGyakorlatDto) {
    return this.gyakorlatService.create(createGyakorlatDto);
  }

  @UseGuards(JwtGuard)
  @Get()
  @ApiOperation({ 
    summary: 'Összes gyakorlat lekérése',
    description: 'Lapozott lista a gyakorlatokról alapvető információkkal (azonosító, név, eszköz és izomcsoportok)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lapozott gyakorlat lista',
    type: GyakorlatokResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Hibás kérés - Érvénytelen lekérdezési paraméterek',
    type: ErrorResponseDto
  })
  findAll(@Query() query: GetGyakorlatokQueryDto) {
    return this.gyakorlatService.findAll(query);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Gyakorlat lekérése azonosító alapján' })
  @ApiResponse({ 
    status: 200, 
    description: 'A kért gyakorlat adatai',
    type: Gyakorlat
  })
  @ApiResponse({ 
    status: 404, 
    description: 'A gyakorlat nem található',
    type: GyakorlatNotFoundDto
  })
  async findOne(@Param('id') id: number) {
    const gyakorlat = await this.gyakorlatService.findOne(+id);
    if (!gyakorlat) {
      throw new NotFoundException(new GyakorlatNotFoundDto(id));
    }
    return gyakorlat;
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Gyakorlat módosítása azonosító alapján' })
  @ApiResponse({ 
    status: 200, 
    description: 'A gyakorlat sikeresen módosítva',
    type: Gyakorlat
  })
  @ApiResponse({ 
    status: 404, 
    description: 'A gyakorlat nem található',
    type: GyakorlatNotFoundDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Hibás kérés - Érvénytelen adatok',
    type: ErrorResponseDto
  })
  async update(@Param('id') id: number, @Body() updateGyakorlatDto: UpdateGyakorlatDto) {
    const gyakorlat = await this.gyakorlatService.update(+id, updateGyakorlatDto);
    if (!gyakorlat) {
      throw new NotFoundException(new GyakorlatNotFoundDto(id));
    }
    return gyakorlat;
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Gyakorlat törlése azonosító alapján' })
  @ApiResponse({ 
    status: 200, 
    description: 'A gyakorlat sikeresen törölve',
    type: SuccessResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'A gyakorlat nem található',
    type: GyakorlatNotFoundDto
  })
  async remove(@Param('id') id: number) {
    const deleted = await this.gyakorlatService.remove(+id);
    if (!deleted) {
      throw new NotFoundException(new GyakorlatNotFoundDto(id));
    }
    return {
      statusCode: 200,
      message: `A(z) ${id} azonosítójú gyakorlat sikeresen törölve`
    };
  }
}
