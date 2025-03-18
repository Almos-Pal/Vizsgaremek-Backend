import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class PaginationMetaDto {
    @ApiProperty({
        example: 1,
        description: 'Aktuális oldalszám'
    })
    currentPage: number;

    @ApiProperty({
        example: 10,
        description: 'Elemek száma oldalanként'
    })
    itemsPerPage: number;

    @ApiProperty({
        example: 100,
        description: 'Összes elem száma'
    })
    totalItems: number;

    @ApiProperty({
        example: 10,
        description: 'Összes oldal száma'
    })
    totalPages: number;

    @ApiPropertyOptional({
        example: false,
        description: 'kedvenc edzések'
    })
    @IsOptional()
    favoriteExercises:boolean
}

export interface PaginatedResponseDto<T> {
    items: T[];
    meta: PaginationMetaDto;
} 