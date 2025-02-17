import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber,  IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {

    @ApiProperty(
        {
            example: 80,
            description: 'A felhasználó a súlya'
        }
    )
    @IsNumber()
    @IsOptional()
    suly?: number;

    @ApiProperty(
        {
            example: 180,
            description: 'A felhasználó a magassága'
        }
    )
    @IsNumber()
    @IsOptional()
    magassag?: number;


    

}
