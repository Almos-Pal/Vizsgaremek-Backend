import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
      await prisma.gyakorlat_Izomcsoport.deleteMany(); 
    await prisma.izomcsoport.deleteMany();
    // TODO: késöbb nézzünk vissza ide, nem tudom mennyire zavar be ha az összes létező gyakorlatot töröljük
   // await prisma.gyakorlat.deleteMany();  

    await prisma.izomcsoport.createMany({
      data: [
        { nev: 'Combfeszítő izom', izomcsoport_id: 1 },
        { nev: 'Vállizom', izomcsoport_id: 2 },
        { nev: 'Hasizom', izomcsoport_id: 3 },
        { nev: 'Mellizom', izomcsoport_id: 4 },
        { nev: 'Combhajlító izom', izomcsoport_id: 5 },
        { nev: 'Tricepsz izom', izomcsoport_id: 6 },
        { nev: 'Bicepsz izom', izomcsoport_id: 7 },
        { nev: 'Széles hátizom', izomcsoport_id: 8 },
        { nev: 'Középső hátizom', izomcsoport_id: 9 },
        { nev: 'Vádli izom', izomcsoport_id: 10 },
        { nev: 'Alsó hátizom', izomcsoport_id: 11 },
        { nev: 'Alkar izom', izomcsoport_id: 12 },
        { nev: 'Farizom', izomcsoport_id: 13 },
        { nev: 'Csuklyás izom', izomcsoport_id: 14 },
        { nev: 'Combközelítő izom', izomcsoport_id: 15 },
        { nev: 'Combtávolító izom', izomcsoport_id: 16 },
        { nev: 'Nyakizom', izomcsoport_id: 17 },
      ],
    });

    const izomcsoportok = await prisma.izomcsoport.findMany();
    console.log('Seeding successful:', izomcsoportok);
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
