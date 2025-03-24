import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto, PaginationMetaDto } from '../../common/dto/pagination.dto';
import { Edzes } from '../entities/edzes.entity';

export class EdzesekResponseDto implements PaginatedResponseDto<Edzes> {
    @ApiProperty({
        description: 'Edzések listája',
        type: () => [Edzes],
        isArray: true
    })
    items: Edzes[];

    @ApiProperty({
        description: 'Lapozási metaadatok',
        type: () => PaginationMetaDto
    })
    meta: PaginationMetaDto;
} 
