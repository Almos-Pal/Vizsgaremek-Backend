import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsDefined, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateEdzesDto {

        @ApiProperty()
        @IsDefined()
        @IsString()
        edzes_neve: string;
        
        @ApiProperty()
        @IsDefined()
        @IsDate()
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
