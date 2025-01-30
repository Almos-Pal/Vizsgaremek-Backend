import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CreateUserGyakorlatDto {
  @ApiProperty({
    description: 'A felhasználó azonosítója',
    required: true,
    example: 1
  })
  @IsNumber()
  user_id: number;

  @ApiProperty({
    description: 'A gyakorlat azonosítója',
    required: true,
    example: 1
  })
  @IsNumber()
  gyakorlat_id: number;

  @ApiProperty({
    description: 'Személyes rekord súly',
    required: false,
    example: 100.5
  })
  @IsNumber()
  @IsOptional()
  personal_best?: number;

  @ApiProperty({
    description: 'Utoljára használt súly',
    required: false,
    example: 90.5
  })
  @IsNumber()
  @IsOptional()
  last_weight?: number;

  @ApiProperty({
    description: 'Utolsó ismétlésszám',
    required: false,
    example: 12
  })
  @IsNumber()
  @IsOptional()
  last_reps?: number;
} 