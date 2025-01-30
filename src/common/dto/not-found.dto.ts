import { ApiProperty } from '@nestjs/swagger';

export class NotFoundDto {
    @ApiProperty({
        example: 404,
        description: 'HTTP státusz kód'
        
    })
    statusCode: number = 404;

    @ApiProperty({
        example: 'Gyakorlat nem található az ID: 1 alapján',
        description: 'Hibaüzenet'
    })
    message: string;

    @ApiProperty({
        example: 'Not Found',
        description: 'Hiba típusa'
    })
    error: string = 'Not Found';

    constructor(entityName: string, id?: string | number) {
        this.message = id 
            ? `${entityName} nem található az ID: ${id} alapján`
            : `${entityName} nem található`;
    }
}

export class GyakorlatNotFoundDto extends NotFoundDto {
    constructor(id?: number) {
        super('Gyakorlat', id);
    }
}

export class EdzesNotFoundDto extends NotFoundDto {
    constructor(id?: number) {
        super('Edzés', id);
    }
}

export class IzomcsoportNotFoundDto extends NotFoundDto {
    constructor(id?: number) {
        super('Izomcsoport', id);
    }
}

export class UserNotFoundDto extends NotFoundDto {
    constructor(id?: number) {
        super('Felhasználó', id);
    }
}

export class UserGyakorlatNotFoundDto extends NotFoundDto {
    constructor(userId?: number, gyakorlatId?: number) {
        const message = userId && gyakorlatId 
            ? `A gyakorlat (${gyakorlatId}) nem található a felhasználónál (${userId})`
            : 'A user-gyakorlat kapcsolat nem található';
        super('User-Gyakorlat');
        this.message = message;
    }
} 