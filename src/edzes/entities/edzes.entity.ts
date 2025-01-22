import { IsDate, IsDefined, IsNumber, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class Edzes {
    
    @ApiProperty({
        example: 1,
        description: 'The unique identifier of the exercise'
    })
    @IsDefined()
    @IsNumber()
    edzes_id: number;

    @ApiProperty({
        example: 'Morning Workout',
        description: 'Name of the exercise'
    })
    @IsString()
    @IsDefined()
    edzes_neve: string;

    @ApiProperty({
        example: '2024-03-20T15:30:00.000Z',
        description: 'Date of the exercise'
    })
    @IsDate()
    @IsDefined()
    datum: Date;

    @ApiProperty({
        example: 1,
        description: 'User ID associated with the exercise',
        required: false
    })
    @IsDefined()
    @IsNumber()
    user_id: number | null;
    
    @ApiProperty({
        example: 60,
        description: 'Duration of the exercise in minutes'
    })
    @IsNumber()
    ido: number;
}
