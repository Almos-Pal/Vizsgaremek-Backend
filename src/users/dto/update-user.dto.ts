import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'newusername', description: 'User name' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ example: 80, description: 'User weight' })
  @IsNumber()
  @IsOptional()
  suly?: number;

  @ApiProperty({ example: 180, description: 'User height' })
  @IsNumber()
  @IsOptional()
  magassag?: number;

  @ApiProperty({ example: 'newpassword', description: 'User password' })
  @IsString()
  @IsOptional()
  password?: string;

  
}
