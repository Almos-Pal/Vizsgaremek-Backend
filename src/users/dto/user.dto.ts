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
    isAdmin?: string;

    @ApiProperty({
        description: 'keresési feltétel email alapján',
        required: false
    })
    @IsOptional()
    @IsString()
    email?: string;
}


export class UserDto {
    @ApiProperty({
        description: 'Unique identifier of the user',
        example: 37,
    })
    user_id: number;

    @ApiProperty({
        description: 'Username of the user',
        example: 'Admin',
    })
    username: string;

    @ApiProperty({
        description: 'Email address of the user',
        example: 'admin@gmail.com',
    })
    email: string;

    @ApiProperty({
        description: 'User weight in kilograms',
        example: null,
        nullable: true,
    })
    suly?: number;

    @ApiProperty({
        description: 'User height in centimeters',
        example: null,
        nullable: true,
    })
    magassag?: number;

    @ApiProperty({
        description: 'Indicates if the user is an administrator',
        example: true,
    })
    isAdmin: boolean;
}

export class UserResponseDto {
    @ApiProperty({
        description: 'List of users',
        type: () => [User],
        isArray: true,

    })
    items: User[];

    @ApiProperty({
        description: 'Pagination metadata',
        example: {
            currentPage: 1,
            itemsPerPage: 1,
            totalItems: 7,
            totalPages: 7
        }
    })
    meta: {
        currentPage: number;
        itemsPerPage: number;
        totalItems: number;
        totalPages: number;
    };
}