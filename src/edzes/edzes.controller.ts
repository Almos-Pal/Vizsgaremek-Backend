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
  findOne(@Param('id') id: string) {
    return this.edzesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEdzeDto: UpdateEdzesDto) {
    return this.edzesService.update(+id, updateEdzeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.edzesService.remove(+id);
  }
}
