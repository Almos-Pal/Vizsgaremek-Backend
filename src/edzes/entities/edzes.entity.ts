import { IsBoolean, IsDate, IsDefined, IsNumber, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

class UserGyakorlatHistory {
    @ApiProperty({ description: 'A gyakorlat súlya' })
    weight: number;

    @ApiProperty({ description: 'Az ismétlések száma' })
    reps: number;

    @ApiProperty({ description: 'A bejegyzés dátuma' })
    date: Date;
}

export class EdzesGyakorlatSet {
    @ApiProperty({
        description: 'A szett azonosítója',
        example: 1
    })
    id: number;

    @ApiProperty({
        description: 'A szett sorszáma',
        example: 1
    })
    set_szam: number;

    @ApiProperty({
        description: 'A gyakorlat súlya',
        example: 100.5
    })
    weight: number;

    @ApiProperty({
        description: 'Az ismétlések száma',
        example: 12
    })
    reps: number;
}

export class EdzesGyakorlat {
    @ApiProperty({
        description: 'A gyakorlat azonosítója',
        example: 1
    })
    gyakorlat_id: number;

    @ApiProperty({
        description: 'A gyakorlat neve',
        example: 'Melledzés'
    })
    gyakorlat: {
        nev: string;
        izomcsoportok: Array<{
            izomcsoport: {
                izomcsoport_id: number;
                nev: string;
            }
        }>;
    };

    @ApiProperty({
        description: 'A gyakorlat szettjei',
        type: [EdzesGyakorlatSet]
    })
    szettek: EdzesGyakorlatSet[];

    @ApiProperty({
        description: 'A szettek száma',
        example: 12
    })
    total_sets: number;

    @ApiProperty({
        description: 'Előző gyakorlat előzmények',
        type: [UserGyakorlatHistory]
    })
    previous_history: UserGyakorlatHistory[];
}

export class Edzes {
    @ApiProperty({
        description: 'Az edzés azonosítója',
        example: 1
    })
    @IsDefined()
    @IsNumber()
    edzes_id: number;

    @ApiProperty({
        description: 'Az edzés neve',
        example: 'Melledzés'
    })
    @IsString()
    @IsDefined()
    edzes_neve: string;

    @ApiProperty({
        description: 'Az edzés dátuma',
        example: '2024-03-15T10:00:00.000Z'
    })
    @IsDate()
    @IsDefined()
    datum: Date;

    @ApiProperty({
        description: 'Az edzés időtartama (percben)',
        example: 60
    })
    @IsNumber()
    ido: number;

    @ApiProperty({
        description: 'Igaz ha az edzés befejeződött',
        example: false,
    })
    @IsBoolean()
    isFinalized?: boolean;

    @ApiProperty({
        description: 'Kedvenc edzés',
        example: false
    })
    isFavorite: boolean;


    @ApiProperty({
        description: 'Az edzéshez tartozó gyakorlatok',
        type: [EdzesGyakorlat]
    })
    gyakorlatok: EdzesGyakorlat[];
}
