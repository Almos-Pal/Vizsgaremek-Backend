import { ApiProperty } from '@nestjs/swagger';

export interface IIzomcsoport {
  id: number;
  nev: string;
}

export interface IGyakorlat {
    gyakorlat_id: number;
    gyakorlat_neve: string;
    personal_best?: number;
    eszkoz?: string;
    gyakorlat_leiras?: string;
    fo_izomcsoport?: number;
    user_id?: number;
    izomcsoportok?: number[];
}

export class Gyakorlat implements IGyakorlat {
    @ApiProperty({
        example: 1,
        description: 'A gyakorlat azonosítója'
    })
    gyakorlat_id: number;

    @ApiProperty({
        example: 'Bench Press',
        description: 'A gyakorlat neve'
    })
    gyakorlat_neve: string;

    @ApiProperty({
        example: 100.5,
        description: 'Személyes legjobb súly/rekord',
        required: false
    })
    personal_best?: number;

    @ApiProperty({
        example: 'Barbell',
        description: 'Eszköz amely szükséges a gyakorlat elvégzéséhez',
        required: false
    })
    eszkoz?: string;

    @ApiProperty({
        example: 'Feküdj a padra, engedd le a rudat a mellkasodhoz, majd nyomd fel',
        description: 'A gyakorlat leírása',
        required: false
    })
    gyakorlat_leiras?: string;

    @ApiProperty({
        example: 1,
        description: 'Fő izomcsoport azonosítója',
        required: false
    })
    fo_izomcsoport?: number;

    @ApiProperty({
        example: 1,
        description: 'A felhasználó azonosítója',
        required: false
    })
    user_id?: number;

    @ApiProperty({
        example: [1, 2, 3],
        description: 'Az érintett izomcsoportok azonosítói',
        required: false,
        type: [Number]
    })
    izomcsoportok?: number[];
}
