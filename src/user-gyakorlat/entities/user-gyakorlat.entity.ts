import { ApiProperty } from '@nestjs/swagger';

export class UserGyakorlat {
  @ApiProperty({
    description: 'A felhasználó azonosítója',
    example: 1
  })
  user_id?: number;

  @ApiProperty({
    description: 'A gyakorlat azonosítója',
    example: 1
  })
  gyakorlat_id?: number;

  @ApiProperty({
    description: 'Személyes rekord súly',
    example: 100.5,
    required: false
  })
  personal_best?: number;

  @ApiProperty({
    description: 'Utoljára használt súly',
    example: 90.5,
    required: false
  })
  last_weight?: number;

  @ApiProperty({
    description: 'Utolsó ismétlésszám',
    example: 12,
    required: false
  })
  last_reps?: number;

  @ApiProperty({
    description: 'Összes elvégzett szett',
    example: 50
  })
  total_sets?: number;

  @ApiProperty({
    description: 'A gyakorlat adatai',
    required: false
  })
  gyakorlat?: any;

  @ApiProperty({
    description: 'Edzés történet',
    required: false,
    type: [Object]
  })
  history?: any[];
} 