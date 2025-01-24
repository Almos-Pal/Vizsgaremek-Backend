import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';
import {parse} from 'csv-parse';

const prisma = new PrismaClient();
const workingDir = process.cwd();
const docsPath = path.join(workingDir, 'public');
const apiFilePath = path.join(docsPath, 'gyaksz.csv');


if (!fs.existsSync(apiFilePath)) {
    console.error('CSV file does not exist:', apiFilePath);
    process.exit(1);
}

interface gyak {
    name: string;
    equipment: string;
    instructions: string;
    rowid:string;
    force:string;
    level:string;
    mechanic:string;
    primaryMuscle:string;
    secondaryMuscle:string;
    images:string;
    id:string;
    category:string;  

}
const headers = ['rowid', 'name', 'force', 'level', 'mechanic', 'equipment', 'primaryMuscle', 'secondaryMuscle', 'instructions', 'category', 'images', 'id'];
const fileContent = fs.readFileSync(apiFilePath, { encoding: 'utf-8' });
const dataToInsert: any[] = [];
let data : gyak[] = [];


parse(fileContent, {
    delimiter: ';',
    columns: headers,
  }, (error, result: gyak[]) => {
    if (error) {
      console.error(error);
    }
     for (const i of result){

        data.push(i);
     }
  });
  

async function main() {
    try {
        await prisma.gyakorlat_Izomcsoport.deleteMany(); 
        await prisma.gyakorlat.deleteMany();
 
            for (const line of data) {
                        try {
                            dataToInsert.push({
                                gyakorlat_neve: line.name,
                                eszkoz: line.equipment,
                                gyakorlat_leiras: line.instructions
                            });

                        } catch (error) {
                            console.error(`Error inserting row:`, error);
                        }
                    }
                   
                    await prisma.gyakorlat.createMany({
                        data: dataToInsert
                    });

                    await prisma.$disconnect();

        const gyakorlat = await prisma.gyakorlat.findMany();
        console.log('Seeding successful:', gyakorlat);
    } catch (error) {
        console.error('Error during seeding:', error);
    } finally {
        await prisma.$disconnect();
    }

}
main();
