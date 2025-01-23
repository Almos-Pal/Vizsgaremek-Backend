import { ApiProperty } from '@nestjs/swagger';

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
}

export interface PaginatedResponseDto<T> {
    items: T[];
    meta: PaginationMetaDto;
} 