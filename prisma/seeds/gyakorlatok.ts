import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';
import { parse } from 'csv-parse';

const prisma = new PrismaClient();
const workingDir = process.cwd();
const docsPath = path.join(workingDir, 'public');
const apiFilePath = path.join(docsPath, 'gyaksz2.csv');


if (!fs.existsSync(apiFilePath)) {
    console.error('CSV file does not exist:', apiFilePath);
    process.exit(1);
}
interface Gyak {
    name: string;
    equipment: string;
    instructions: string;
    rowid: string;
    force: string;
    level: string;
    mechanic: string;
    primaryMuscle: string;
    secondaryMuscle: string;
    images: string;
    id: string;
    category: string;
}

const headers = ['rowid', 'name', 'force', 'level', 'mechanic', 'equipment', 'primaryMuscle', 'secondaryMuscle', 'instructions', 'category', 'images', 'id'];
const fileContent = fs.readFileSync(apiFilePath, { encoding: 'utf-8' });
const dataToInsert: any[] = [];
let data: Gyak[] = [];

parse(fileContent, {
    from_line: 2,
    delimiter: ';',
    columns: headers,
}, (error, result: Gyak[]) => {
    if (error) {
        console.error(error);
    }
    for (const i of result) {
        data.push(i);
    }
});

async function main() {
    try {
        
        await prisma.gyakorlat_Izomcsoport.deleteMany();
        await prisma.edzes_Gyakorlat_Set.deleteMany();
        await prisma.user_Gyakorlat_History.deleteMany();
        await prisma.edzes_Gyakorlat.deleteMany();
        await prisma.edzes.deleteMany();
        await prisma.user_Gyakorlat.deleteMany();
        await prisma.gyakorlat.deleteMany();
        
        for (const line of data) {
            //console.log(line.secondaryMuscle.substring(1,line.secondaryMuscle.length-1).split(';').map(Number));
            try {
                // Create the gyakorlat first and get its ID
                const createdGyakorlat = await prisma.gyakorlat.create({
                    data: {
                        gyakorlat_neve: line.name,
                        eszkoz: line.equipment,
                        gyakorlat_leiras: line.instructions,
                        user_id: 0,
                        fo_izomcsoport: parseInt(line.primaryMuscle.replace(/\D/g, "")),
                   }
                });

                // Create primary muscle group connection using the new ID
                await prisma.gyakorlat_Izomcsoport.create({
                    data: {
                        gyakorlat_id: createdGyakorlat.gyakorlat_id,
                        izomcsoport_id: parseInt(line.primaryMuscle.replace(/\D/g, ""))    
                }});

                // Create secondary muscle group connections using the new ID
                for (const id of line.secondaryMuscle.substring(1, line.secondaryMuscle.length - 1).split(';').map(Number)) {
                    if(id != 0) {
                        try {
                            await prisma.gyakorlat_Izomcsoport.create({
                                data: {
                                    gyakorlat_id: createdGyakorlat.gyakorlat_id,
                                    izomcsoport_id: id
                                }
                            });
                        } catch {
                           // console.error(`Létező elem:`, createdGyakorlat.gyakorlat_id, id);
                        }
                    } else {
                      //  console.log('No secondary muscle');
                    }
                }
            } catch (error) {
                console.error(`Error inserting row:`, error);
            }
        }
        const gyakorlat = await prisma.gyakorlat.findMany();
        //console.log('Seeding successful:', gyakorlat);
    } catch (error) {
        console.error('Error during seeding:', error);
    } finally {
        await prisma.$disconnect();
    }
}
main();