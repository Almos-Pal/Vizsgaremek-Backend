import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponseDto, PaginationMetaDto } from '../../common/dto/pagination.dto';
import { User } from "../entities/user.entity";

export class GetUserQueryDto extends PaginationQueryDto {
    @ApiProperty({
        description: 'keresési feltétel felhasználónév alapján',
        required: false
    })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiProperty({
        description: 'keresési feltétel isAdmin alapján',
        required: false
    })
    @IsOptional()
    @IsBoolean()
    isAdmin?: boolean;

    @ApiProperty({
        description: 'keresési feltétel email alapján',
        required: false
    })
    @IsOptional()
    @IsString()
    email?: string;
}

export class UserResponseDto implements PaginatedResponseDto<User> {
    @ApiProperty({
        description: 'User-Gyakorlat kapcsolatok listája',
        type: () => [User],
        isArray: true
    })
    items: User[] ;

    @ApiProperty({
        description: 'Lapozási metaadatok',
        type: () => PaginationMetaDto
    })
    meta: PaginationMetaDto;
} 