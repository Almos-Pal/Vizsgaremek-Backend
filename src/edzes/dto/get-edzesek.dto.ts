import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class GetEdzesekQueryDto extends PaginationQueryDto {
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
        description: 'Filter edzések by user ID',
        required: false,
        type: Number
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    user_id?: number;

    @IsString()
    @IsOptional()
    @Type(() => String)
    startDate?: string;

    @IsString()
    @IsOptional()
    @Type(() => String)
    endDate?: string;

    @IsString()
    @IsOptional()
    @Type(() => String)
    type?: "week" | "month" | "halfyear" | "all";
} 