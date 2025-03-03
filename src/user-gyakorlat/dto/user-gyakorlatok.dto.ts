import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto, PaginationMetaDto } from '../../common/dto/pagination.dto';
import { UserGyakorlat } from '../entities/user-gyakorlat.entity';

export class GetUserGyakorlatokQueryDto {
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
        description: " Ez a tulajdonság arra szolgál, hogy meghatározza, a rekord boolean értékként",
        required: false,
        default: false
    })
    isRecord?: boolean;

    @ApiProperty({
        description: 'Keresési feltétel gyakorlat neve alapján',
        required: false
    })
    search?: string;
}

export class UserGyakorlatokResponseDto implements PaginatedResponseDto<UserGyakorlat> {
    @ApiProperty({
        description: 'User-Gyakorlat kapcsolatok listája',
        type: () => [UserGyakorlat],
        isArray: true
    })
    items: UserGyakorlat[] ;

    @ApiProperty({
        description: 'Lapozási metaadatok',
        type: () => PaginationMetaDto
    })
    meta: PaginationMetaDto;
} 