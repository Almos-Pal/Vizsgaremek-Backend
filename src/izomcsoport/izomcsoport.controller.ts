import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IzomcsoportService } from './izomcsoport.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Izomcsoport } from './entities/izomcsoport.entity';
import { ErrorResponseDto } from 'src/common/dto';


@Controller('izomcsoport')
export class IzomcsoportController {
  constructor(private readonly izomcsoportService: IzomcsoportService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Összes Izom lekérése',
    description: 'Lista az összes izomcsoportról',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Izomcsoport lista',
    type: Izomcsoport,
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Hibás kérés - Érvénytelen lekérdezési paraméterek',
    type: ErrorResponseDto
  })
  findAll() {
    return this.izomcsoportService.findAll();
  }
}
