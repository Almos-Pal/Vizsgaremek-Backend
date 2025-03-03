import {IsBoolean, IsDefined, IsEmail, IsNumber, IsOptional, IsString, IsStrongPassword } from "class-validator";

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

    @IsOptional()
    @IsBoolean()
    isAdmin: boolean = false;
}
