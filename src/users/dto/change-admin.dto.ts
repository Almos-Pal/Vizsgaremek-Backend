import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDefined } from 'class-validator';

export class AdminDto {
    
    @ApiProperty({ example: 'true', description: 'IsAdmin?' })
    @IsDefined()
    @IsBoolean()
    isAdmin: boolean = false;
}