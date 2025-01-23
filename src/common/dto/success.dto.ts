import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto {
    @ApiProperty({
        example: 200,
        description: 'HTTP státusz kód'
    })
    statusCode: number;

    @ApiProperty({
        example: 'A művelet sikeres',
        description: 'Sikeres művelet üzenete'
    })
    message: string;
} 