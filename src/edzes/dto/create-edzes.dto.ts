import { IsDate, IsDefined, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateEdzesDto {

        @IsDefined()
        @IsString()
        edzes_neve: string;
        
        @IsDefined()
        @IsDate()
        datum: Date;

        @IsDefined()
        @IsDate()
        user_id: number;

        @IsDefined()
        @IsNumber()
        ido: number;

}
