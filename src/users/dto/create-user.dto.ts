import { IsString, IsEmail, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsBoolean()
  isAdmin: boolean;

  @IsNumber()
  @IsOptional()
  suly?: number;

  @IsNumber()
  @IsOptional()
  magassag?: number;
}
