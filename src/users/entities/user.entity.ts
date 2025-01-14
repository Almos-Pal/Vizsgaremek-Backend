import { IsDefined, IsEmail, IsNumber, IsString, IsStrongPassword } from "class-validator";

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
}
