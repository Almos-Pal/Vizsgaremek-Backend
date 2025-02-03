import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CreateGyakorlatSzettDto {
  @ApiProperty({
    description: 'A gyakorlat azonosítója',
    required: true
  })
  @IsNumber()
  gyakorlat_id: number;

  @ApiProperty({
    description: 'A felhasználó azonosítója',
    required: true
  })
  @IsNumber()
  user_id: number;

  @ApiProperty({
    description: 'Használt súly',
    required: true
  })
  @IsNumber()
  weight: number;

  @ApiProperty({
    description: 'Ismétlések száma',
    required: true
  })
  @IsNumber()
  reps: number;

  @ApiProperty({
    description: 'Az edzés azonosítója',
    required: false
  })
  @IsNumber()
  @IsOptional()
  edzes_id?: number;

  @ApiProperty({
    description: 'Szett sorszáma az edzésen belül',
    required: true
  })
  @IsNumber()
  szett_szam: number;
} 