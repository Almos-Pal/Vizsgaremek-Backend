import {IsDefined, IsEmail, IsNumber, IsString, IsStrongPassword } from "class-validator";


export class LoginDto {

    @IsDefined()
    @IsString()
    @IsEmail()
    email: string;
    
    @IsDefined()
    @IsString()
    @IsStrongPassword()
    password: string;
}