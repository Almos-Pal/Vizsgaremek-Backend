import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsInt, IsString, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
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


    @ApiPropertyOptional({
        description: 'Kedvenc edzés',
        required: false,
        default: false
    })
    @IsOptional()
    favoriteExercises?: boolean = false;

    @ApiPropertyOptional({
        description: 'A felhasználó azonosítója',
        type: Number
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    user_id?: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    gyakorlat_id?: number;

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

    @ApiPropertyOptional({
        description: 'Sablon-e az edzés',
        type: Boolean
    })
    @IsOptional()
    @IsBoolean()
    isTemplate?: boolean;

    @IsOptional()
    @IsBoolean()
    isFavorite?: boolean;

    @IsString()
    @IsOptional()
    @Type(() => String)
    orderBy?: "byFavorite"|"asc"|"desc";
   
} 