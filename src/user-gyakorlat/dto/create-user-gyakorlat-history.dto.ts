import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserGyakorlatHistoryDto {
  @ApiProperty({
    description: 'A felhasználó azonosítója',
    required: true,
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({
    description: 'A gyakorlat azonosítója',
    required: true,
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  gyakorlat_id: number;

  @ApiProperty({
    description: 'Az edzésen használt súly',
    required: true,
    example: 100.5
  })
  @IsNumber()
  @IsNotEmpty()
  weight: number;

  @ApiProperty({
    description: 'Az elvégzett ismétlések száma',
    required: true,
    example: 12
  })
  @IsNumber()
  @IsNotEmpty()
  reps: number;

  @ApiProperty({
    description: 'Az edzés azonosítója',
    required: true,
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  edzes_id: number;
} 