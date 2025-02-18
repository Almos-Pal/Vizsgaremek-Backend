import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

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
                    password: await hash('Admin123.',10),
                    //admin: true
                },
                {
                    email: 'user@gmail.com',
                    username: 'BasicUser',
                    password: await hash('User123.', 10),
                },
                {
                    email: 'pepesdenes@gmail.com',
                    username: 'PepesDenes',
                    password: await hash('Pepes123.',10),
                },
                {
                    email: 'veghbela@gmail.com',
                    username: 'VeghBela',
                    password: await hash('Vegh123.',10),
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