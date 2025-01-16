import { IsDate, IsDefined, IsNumber, IsString } from "class-validator";

export class Edzes {
    
    @IsDefined()
    @IsNumber()
    edzes_id: number;

    @IsString()
    @IsDefined()
    edzes_neve: string;

    @IsDate()
    @IsDefined()
    datum: Date;

    @IsDefined()
    @IsNumber()
    user_id: number;
    
    @IsNumber()
    ido: number;
}
