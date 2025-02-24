import {IsBoolean, IsDefined, IsEmail, IsNumber, IsString, IsStrongPassword } from "class-validator";

export class CreateUserDto {

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

    @IsBoolean()
    isAdmin?: boolean;
}
