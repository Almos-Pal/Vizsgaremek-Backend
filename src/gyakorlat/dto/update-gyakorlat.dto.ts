import { PartialType } from '@nestjs/swagger';
import { CreateGyakorlatDto } from './create-gyakorlat.dto';

export class UpdateGyakorlatDto extends PartialType(CreateGyakorlatDto) {}
