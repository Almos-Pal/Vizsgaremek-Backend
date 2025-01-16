import { PartialType } from '@nestjs/mapped-types';
import { CreateEdzesDto } from './create-edzes.dto';

export class UpdateEdzesDto extends PartialType(CreateEdzesDto) {}
