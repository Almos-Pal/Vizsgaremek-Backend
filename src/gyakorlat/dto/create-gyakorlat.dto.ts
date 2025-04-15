import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateGyakorlatDto {
    @ApiProperty({
        example: 'Fekvenyomás',
        description: 'A gyakorlat megnevezése'
    })
    @IsString()
    gyakorlat_neve: string;


    @ApiProperty({
        example: 'Rúd',
        description: 'A gyakorlathoz szükséges eszköz',
        required: false
    })
    @IsOptional()
    @IsString()
    eszkoz?: string;

    @ApiProperty({
        example: 'Feküdj a padra, engedd le a rudat a mellkasodhoz, majd nyomd fel',
        description: 'A gyakorlat részletes leírása',
        required: false
    })
    @IsOptional()
    @IsString()
    gyakorlat_leiras?: string;

    @ApiProperty({
        example: 1,
        description: 'A fő izomcsoport azonosítója',
        required: false
    })
    @IsOptional()
    @IsNumber()
    fo_izomcsoport?: number;

    @ApiProperty({
        example: [1, 2, 3],
        description: 'Az érintett izomcsoportok azonosítói',
        type: [Number]
    })
    @IsArray()
    @IsNumber({}, { each: true })
    izomcsoportok: number[];
}
