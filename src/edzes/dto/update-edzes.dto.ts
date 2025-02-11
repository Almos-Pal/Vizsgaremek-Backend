import { CreateEdzesDto } from './create-edzes.dto';
import { PartialType } from '@nestjs/swagger';


export class UpdateEdzesDto extends PartialType(CreateEdzesDto) {}