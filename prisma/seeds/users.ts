import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.user.deleteMany();
        await prisma.user_Gyakorlat.deleteMany();
        //Késöbb az összes többi user related táblát is törölni kell

        await prisma.user.createMany({
            data: [
                {
                    email: 'admin@gmail.com',
                    username: 'Admin',
                    password: 'Admin123.',
                    admin: true
                },
                {
                    email: 'user@gmail.com',
                    username: 'BasicUser',
                    password: 'User123.',
                },
                {
                    email: 'pepesdenes@gmail.com',
                    username: 'PepesDenes',
                    password: 'Pepes123.',
                },
                {
                    email: 'veghbela@gmail.com',
                    username: 'VeghBela',
                    password: 'Vegh123.',
                }
            ]
        })

        const users = await prisma.user.findMany();
        console.log('Seeding successful:', users);



    }
    catch (error) {
        console.error('Error during seeding:', error);

    } finally {
        await prisma.$disconnect();
    }
 }

 main();