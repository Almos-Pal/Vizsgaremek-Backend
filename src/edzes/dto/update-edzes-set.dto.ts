import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min } from 'class-validator';

export class UpdateEdzesSetDto {
  @ApiProperty({
    description: 'A gyakorlat során használt súly (kg)',
    example: 60
  })
  @IsNumber()
  @Min(0)
  weight: number;

  @ApiProperty({
    description: 'Az ismétlések száma',
    example: 12
  })
  @IsInt()
  @Min(0)
  reps: number;
} 