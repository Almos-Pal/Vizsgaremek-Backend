import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EdzesService } from './edzes.service';
import { CreateEdzesDto } from './dto/create-edzes.dto';
import { UpdateEdzesDto } from './dto/update-edzes.dto';

@Controller('edzes')
export class EdzesController {
  constructor(private readonly edzesService: EdzesService) {}

  @Post()
  create(@Body() createEdzeDto: CreateEdzesDto) {
    return this.edzesService.create(createEdzeDto);
  }

  @Get()
  findAll() {
    return this.edzesService.findAll();
  }

  @Get(':id')
 async findOne(@Param('id') id: string) {
    return await this.edzesService.findOne(+id);
  }

  @Patch(':id')
 async update(@Param('id') id: string, @Body() updateEdzeDto: UpdateEdzesDto) {
    return await this.edzesService.update(+id, updateEdzeDto);
  }

  @Delete(':id')
 async remove(@Param('id') id: string) {
    return await this.edzesService.remove(+id);
  }
}
