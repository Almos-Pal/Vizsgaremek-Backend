import { IsArray, IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { CreateEdzesDto } from './create-edzes.dto';
import { PartialType } from '@nestjs/swagger';
import { Gyakorlat } from '@prisma/client';


export class UpdateEdzesDto extends PartialType(CreateEdzesDto) {
    
    @IsNumber()
    @IsOptional()
    edzes_id: number;

    @IsArray()
    @IsOptional()
    gyakorlatok: Gyakorlat[];

    @IsBoolean()
    @IsOptional()
    isFavorite: boolean;
}