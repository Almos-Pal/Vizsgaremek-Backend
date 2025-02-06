// import { PartialType } from '@nestjs/mapped-types';
import { CreateEdzesDto } from './create-edzes.dto';
import { PartialType } from '@nestjs/swagger';


export class UpdateEdzesDto extends PartialType(CreateEdzesDto) {}
// this is another test