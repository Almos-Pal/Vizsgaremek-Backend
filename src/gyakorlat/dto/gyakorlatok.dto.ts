import { ApiProperty } from '@nestjs/swagger';
import { IGyakorlat, Gyakorlat } from '../entities/gyakorlat.entity';
import { PaginatedResponseDto, PaginationMetaDto } from '../../common/dto/pagination.dto';
import { GyakorlatListItemDto } from './gyakorlat-list-item.dto';

export class GyakorlatokResponseDto implements PaginatedResponseDto<GyakorlatListItemDto> {
    @ApiProperty({
        description: 'Gyakorlatok listája',
        type: () => [GyakorlatListItemDto],
        isArray: true
    })
    items: GyakorlatListItemDto[];

    @ApiProperty({
        description: 'Lapozási metaadatok',
        type: () => PaginationMetaDto
    })
    meta: PaginationMetaDto;
}

// Optional: Query parameters DTO for filtering and pagination
export class GetGyakorlatokQueryDto {
    @ApiProperty({
        description: 'Oldalszám',
        required: false,
        default: 1,
        minimum: 1
    })
    page?: number = 1;

    @ApiProperty({
        description: 'Elemek száma oldalanként',
        required: false,
        default: 10,
        minimum: 1,
        maximum: 100
    })
    limit?: number = 10;

    @ApiProperty({
        description: 'Szűrés felhasználó azonosító alapján',
        required: false
    })
    userId?: number;

    @ApiProperty({
        description: 'Szűrés izomcsoport azonosító alapján',
        required: false
    })
    muscleId?: number;
} 