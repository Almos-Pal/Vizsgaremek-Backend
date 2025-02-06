import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class Izomcsoport {

    @ApiProperty({
        example: '1',
        description: 'Az izomcsoport azonosítója'
    })
    @IsNumber()
    izomcsoport_id: number;

    @ApiProperty({
        example: 'hasizom',
        description: 'Az izomcsoport neve'
    })
    @IsString()
    izomcsoport_neve: string;
}
