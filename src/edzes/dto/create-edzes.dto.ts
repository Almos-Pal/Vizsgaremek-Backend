import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsDateString, IsArray, ValidateNested, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEdzesSetDto {
  @ApiProperty({
    description: 'A szett sorszáma',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  set_szam: number;

  @ApiProperty({
    description: 'Az elvégzett súly ebben a szettben',
    example: 100.5
  })
  @IsNumber()
  @IsNotEmpty()
  weight: number;

  @ApiProperty({
    description: 'Az elvégzett ismétlések száma ebben a szettben',
    example: 12
  })
  @IsNumber()
  @IsNotEmpty()
  reps: number;
}

export class CreateEdzesExerciseDto {
  @ApiProperty({
    description: 'A gyakorlat azonosítója',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  gyakorlat_id: number;

  @ApiProperty({
    description: 'A gyakorlat szettjei',
    type: [CreateEdzesSetDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEdzesSetDto)
  szettek: CreateEdzesSetDto[];
}

export class CreateEdzesDto {
  @ApiProperty({
    description: 'Az edzés neve',
    example: 'Láb nap'
  })
  @IsString()
  @IsNotEmpty()
  edzes_neve: string;

  @ApiProperty({
    description: 'Az edzés dátuma',
    example: '2024-03-20'
  })
  @IsOptional()
  @IsDateString()
  datum?: string;

  @ApiProperty({
    description: 'A felhasználó azonosítója',
    example: 1
  })
  @IsInt()
  @IsOptional()
  user_id: number;

  @ApiProperty({
    description: 'Az edzés időtartama percben',
    example: 60,
    required: false
  })
  @IsNumber()
  @IsOptional()
  ido?: number;

  @ApiProperty({
    description: 'Igaz ha az edzés befejeződött',
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isFinalized?: boolean;

  @ApiPropertyOptional({
    description: 'Sablon-e az edzés',
    example: false,
    required: false
})

  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

}
