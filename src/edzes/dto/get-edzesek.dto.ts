import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsInt, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class GetEdzesekQueryDto extends PaginationQueryDto {
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

    @ApiPropertyOptional({
        description: 'A felhasználó azonosítója',
        type: Number
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    user_id?: number;

    @ApiPropertyOptional({
        description: 'Sablon-e az edzés',
        type: Boolean
    })
    @IsOptional()
    @IsBoolean()
    isTemplate?: boolean;

    @ApiPropertyOptional({
        description: "keresés típusa",
        type: String
    })
    @IsOptional()
    type?: string;
} 