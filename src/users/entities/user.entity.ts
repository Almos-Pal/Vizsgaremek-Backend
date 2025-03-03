import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDefined, IsEmail, IsNumber, IsOptional, IsString, IsStrongPassword } from "class-validator";

export class User {

    @ApiProperty()
    @IsDefined()
    @IsNumber()
    user_id: number;

    @ApiProperty()
    @IsDefined()
    @IsString()
    username: string;

    @ApiProperty()
    @IsDefined()
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({ required: false })
    @IsDefined()
    @IsString()
    @IsStrongPassword()
    password?: string;

    @ApiProperty()
    @IsDefined()
    @IsBoolean()
    isAdmin: boolean;

    @ApiProperty(
        {
            example: 80,
            description: 'A felhasználó a súlya'
        }
    )
    @IsNumber()
    @IsOptional()
    @ApiProperty({ required: false })
    suly?: number | null;

    @ApiProperty(
        {
            example: 180,
            description: 'A felhasználó a magassága'
        }
    )
    @IsNumber()
    @IsOptional()
    @ApiProperty({ required: false })
    magassag?: number | null;
}
