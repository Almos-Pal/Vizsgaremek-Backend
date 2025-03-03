import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDefined, IsEmail, IsNumber, IsOptional, IsString, IsStrongPassword } from "class-validator";

export class User {

    @IsDefined()
    @IsNumber()
    user_id: number;

    @IsDefined()
    @IsString()
    username: string;

    @IsDefined()
    @IsString()
    @IsEmail()
    email: string;

    @IsDefined()
    @IsString()
    @IsStrongPassword()
    password: string;


    @IsDefined()
    @IsBoolean()
    isAdmin?: boolean;

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
