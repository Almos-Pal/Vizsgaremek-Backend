import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
    @ApiProperty({
        example: 400,
        description: 'HTTP státusz kód'
    })
    statusCode: number;

    @ApiProperty({
        example: 'Hibás kérés',
        description: 'Hiba üzenet'
    })
    message: string;

    @ApiProperty({
        example: 'Bad Request',
        description: 'Hiba típusa'
    })
    error: string;
} 