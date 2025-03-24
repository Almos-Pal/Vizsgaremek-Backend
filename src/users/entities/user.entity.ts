import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDefined, IsEmail, IsNumber, IsOptional, IsString, IsStrongPassword } from "class-validator";

export class User {

    @ApiProperty({
        example: 1,
        description: 'A felhasználó azonosítója'
    })
    @IsDefined()
    @IsNumber()
    user_id: number;

    @ApiProperty({
        example: 'teszt',
        description: 'A felhasználó felhasználóneve'
    })
    @IsDefined()
    @IsString()
    username: string;

    @ApiProperty({
        example: 'teszt@gmail.com',
        description: 'A felhasználó email címe'
    })
    @IsDefined()
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({ 
        example: 'Teszt1234.',
        description: 'A felhasználó jelszava (erős jelszó, legalább 8 karakter, tartalmazzon kis- és nagybetűt, számot és speciális karaktert)'
     })
    @IsDefined()
    @IsString()
    @IsStrongPassword()
    password?: string;

    @ApiProperty({
        example: false,
        description: 'A felhasználó admin jogosultsággal rendelkezik-e'
    })
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
