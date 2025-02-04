import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AddEdzesGyakorlatDto {
  @ApiProperty({
    description: 'A gyakorlat azonosítója',
    example: 1
  })
  @IsInt()
  gyakorlat_id: number;
} 