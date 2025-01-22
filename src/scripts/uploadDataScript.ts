import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const csvFilePath = path.join('./public/data.csv'); // Adjust the path to your CSV file

// Define the mapping between CSV columns and database columns for the gyakorlat table
const gyakorlatColumnMapping: { [key: string]: string } = {
    'name': 'gyakorlat_neve',
    //'personal_best': 'personal_best',
    'equipment': 'eszkoz',
    'instructions': 'gyakorlat_leiras',
};


async function uploadData() {
    const results: any[] = [];

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            for (const row of results) {
                try {
                    const dataToInsert: any = {};

                    // Map CSV columns to Prisma model fields using the mapping object
                    for (const csvColumn in gyakorlatColumnMapping) {
                        if (row.hasOwnProperty(csvColumn)) {
                            const dbColumn = gyakorlatColumnMapping[csvColumn];
                            dataToInsert[dbColumn] = isNaN(row[csvColumn]) ? row[csvColumn] : parseFloat(row[csvColumn]);
                        }
                    }

                    await prisma.gyakorlat.create({
                        data: dataToInsert,
                    });
                    console.log(`Inserted: ${JSON.stringify(dataToInsert)}`);
                } catch (error) {
                    console.error(`Error inserting row:`, error);
                }
            }
            await prisma.$disconnect();
        });
}

uploadData().catch((error) => {
    console.error('Error uploading data:', error);
    prisma.$disconnect();
});



//Object.assign( gyakorlatColumnMapping);