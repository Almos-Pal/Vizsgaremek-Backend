import { ApiProperty } from '@nestjs/swagger';

export class GyakorlatListItemDto {
    @ApiProperty({
        example: 1,
        description: 'A gyakorlat egyedi azonosítója'
    })
    gyakorlat_id: number;

    @ApiProperty({
        example: 'Fekvenyomás',
        description: 'A gyakorlat megnevezése'
    })
    gyakorlat_neve: string;

    @ApiProperty({
        example: 'Rúd',
        description: 'A gyakorlathoz szükséges eszköz',
        required: false
    })
    eszkoz?: string;

    @ApiProperty({
        example: 1,
        description: 'A fő izomcsoport azonosítója',
        required: false
    })
    fo_izomcsoport?: number;

    @ApiProperty({
        example: [1, 2, 3],
        description: 'Az érintett izomcsoportok azonosítói',
        type: [Number]
    })
    izomcsoportok: number[];
} 