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
        example: 1,
    })
    user_id: number;

    @ApiProperty({
        description: 'Username of the user',
        example: 'ExampleUser',
    })
    username: string;

    @ApiProperty({
        description: 'Email address of the user',
        example: 'example@gmail.com',
    })
    email: string;

    @ApiProperty({
        description: 'User weight in kilograms',
        example: 80,
        nullable: true,
    })
    suly?: number;

    @ApiProperty({
        description: 'User height in centimeters',
        example: 180,
        nullable: true,
    })
    magassag?: number;

    @ApiProperty({
        description: 'Indicates if the user is an administrator',
        example: false,
    })
    isAdmin: boolean;
}

export class UserLogiResponsenDto extends UserDto {


    @ApiProperty({
        description: 'Access token of the user',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    })
    accessToken: string;

    @ApiProperty({
        description: 'Refresh token of the user',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    })
    refreshToken: string;

    @ApiProperty({
        description: 'Token expiration time in seconds',
        example: 3600,
    })
    expiresIn: number;

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