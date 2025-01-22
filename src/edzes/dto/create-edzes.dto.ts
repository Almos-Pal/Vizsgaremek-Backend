import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsDefined, IsNumber, IsOptional, IsString } from "class-validator";
import { Transform, Type } from 'class-transformer';

export class CreateEdzesDto {

        @ApiProperty()
        @IsDefined()
        @IsString()
        edzes_neve: string;
        
        @ApiProperty({ 
            example: '2024-03-20T15:30:00.000Z',
            description: 'Date of the exercise'
        })
        @IsDefined()
        @IsDate()
        @Type(() => Date)
        datum: Date;

        @ApiProperty()
        @IsOptional()
        @IsNumber()
        user_id: number;

        @ApiProperty()
        @IsDefined()
        @IsNumber()
        ido: number;

}
