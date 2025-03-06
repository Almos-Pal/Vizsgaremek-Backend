import { ApiProperty } from '@nestjs/swagger';
import { IGyakorlat, Gyakorlat } from '../entities/gyakorlat.entity';
import { PaginatedResponseDto, PaginationMetaDto } from '../../common/dto/pagination.dto';
import { GyakorlatListItemDto } from './gyakorlat-list-item.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

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

export class GetGyakorlatokQueryDto {
    @ApiProperty({
        description: 'Oldalszám',
        required: false,
        default: 1,
        minimum: 1
    })
    @IsOptional()
    page?: number = 1;

    @ApiProperty({
        description: 'Elemek száma oldalanként',
        required: false,
        default: 10,
        minimum: 1,
        maximum: 100
    })
    @IsOptional()
    limit?: number = 10;

    @ApiProperty({
        description: 'Szűrés a gyakorlat nevére',
        required: false
    })
    @IsString()
    @IsOptional()

    nev?: string;

    @ApiProperty({
        description: 'Szűrés a fő izomcsoport azonosítójára',
        required: false
    })
    @IsOptional()
    @IsNumber()
    izomcsoportId?: number;


        @ApiProperty({
            description: 'Szűrés izomcsoportokra',
            required: false,
            type: [Number]
        })
        @IsNumber({}, { each: true })
        @IsOptional()
        @Transform(({ value }) => 
            typeof value === 'string' ? value.split(',').map(Number) : value
        )
        izomcsoportok?: number[];
    
    @ApiProperty({
        description: 'Szűrés eszközökre',
        required: false
    })
    @IsString()
    @IsOptional()
    eszkoz?: string;

} 