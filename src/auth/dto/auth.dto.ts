import {IsDefined, IsEmail, IsNumber, IsString, IsStrongPassword } from "class-validator";


export class LoginDto {

    @IsDefined()
    @IsString()
    email: string;
    
    @IsDefined()
    @IsString()
    password: string;
}