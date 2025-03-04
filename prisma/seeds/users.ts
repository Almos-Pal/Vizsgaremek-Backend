import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.user_Gyakorlat_History.deleteMany();
        await prisma.user_Gyakorlat.deleteMany();
        await prisma.edzes_Gyakorlat_Set.deleteMany();
        await prisma.edzes_Gyakorlat.deleteMany();
        await prisma.edzes.deleteMany();
        await prisma.user.deleteMany();
        
        const data = [ 
            {
                email: 'admin@gmail.com',
                username: 'Admin',
                password: await hash('Admin123.',10),
                isAdmin: true
               
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


        for (const userData of data) {
            await prisma.user.create({
                data: userData,
            });
        }

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