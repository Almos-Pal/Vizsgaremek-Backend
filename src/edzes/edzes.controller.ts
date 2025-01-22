import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EdzesService } from './edzes.service';
import { CreateEdzesDto } from './dto/create-edzes.dto';
import { UpdateEdzesDto } from './dto/update-edzes.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Edzes } from './entities/edzes.entity';

@ApiTags('Edzes')
@Controller('edzes')
export class EdzesController {
  constructor(private readonly edzesService: EdzesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new exercise' })
  @ApiResponse({ 
    status: 201, 
    description: 'Exercise has been successfully created.',
    type: Edzes
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid data provided.' 
  })
  create(@Body() createEdzesDto: CreateEdzesDto) {
    return this.edzesService.create(createEdzesDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all exercises' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns all exercises',
    type: [Edzes]
  })
  findAll() {
    return this.edzesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exercise by id' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the exercise',
    type: Edzes
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Exercise not found' 
  })
  findOne(@Param('id') id: number) {
    return this.edzesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update exercise by id' })
  @ApiResponse({ 
    status: 200, 
    description: 'Exercise has been successfully updated',
    type: Edzes
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Exercise not found' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid data provided' 
  })
  update(@Param('id') id: number, @Body() updateEdzesDto: UpdateEdzesDto) {
    return this.edzesService.update(+id, updateEdzesDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete exercise by id' })
  @ApiResponse({ 
    status: 200, 
    description: 'Exercise has been successfully deleted' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Exercise not found' 
  })
  remove(@Param('id') id: number) {
    return this.edzesService.remove(+id);
  }
}
