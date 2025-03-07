import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Starting database cleanup...");
        await prisma.user_Gyakorlat_History.deleteMany();
        await prisma.edzes_Gyakorlat_Set.deleteMany();
        await prisma.edzes_Gyakorlat.deleteMany();
        await prisma.edzes.deleteMany();
        await prisma.user_Gyakorlat.deleteMany();
        console.log("Database cleaned up successfully.");

        const users = await prisma.user.findMany();
        console.log(`Fetched ${users.length} users.`);

        const gyakorlatok = await prisma.gyakorlat.findMany({ take: 10 });
        console.log(`Fetched ${gyakorlatok.length} exercises.`);

        for (const user of users) {
            console.log(`Seeding workouts for user: ${user.user_id}...`);
            
            const mainExercises = faker.helpers.arrayElements(gyakorlatok, 3);
            const otherExercises = gyakorlatok.filter(g => !mainExercises.includes(g));

            for (let i = 0; i < 10; i++) {
                const workoutDate = faker.date.between({
                    from: new Date(2024, 0, 1 + i * 7),
                    to: new Date(2024, 0, 3 + i * 7),
                });

                const edzes = await prisma.edzes.create({
                    data: {
                        edzes_neve: faker.helpers.arrayElement([
                            "Melledzés",
                            "Hátedzés",
                            "Lábedzés",
                            "Válledzés",
                            "Teljes test edzés",
                        ]),
                        datum: workoutDate,
                        user_id: user.user_id,
                        ido: faker.number.int({ min: 45, max: 120 }) * 60,
                        isFinalized: true,
                    },
                });

                console.log(`Created workout (${edzes.edzes_id}) for user ${user.user_id}`);

                const workoutMainExercises = faker.helpers.arrayElements(mainExercises, 2);
                const workoutOtherExercises = faker.helpers.arrayElements(
                    otherExercises,
                    faker.number.int({ min: 1, max: 3 })
                );
                const workoutExercises = [...workoutMainExercises, ...workoutOtherExercises];

                for (const gyakorlat of workoutExercises) {
                    const baseWeight = faker.number.float({ min: 20, max: 60, fractionDigits: 1 });
                    const progressionMultiplier = 1 + i * 0.05;
                    const currentWeight = baseWeight * progressionMultiplier;

                    const numSets = faker.number.int({ min: 3, max: 5 });
                    const sets = Array.from({ length: numSets }, (_, index) => ({
                        set_szam: index + 1,
                        weight: faker.number.float({
                            min: currentWeight * 0.95,
                            max: currentWeight * 1.05,
                            fractionDigits: 1,
                        }),
                        reps: faker.number.int({ min: 8, max: 12 }),
                    }));

                    const edzesGyakorlat = await prisma.edzes_Gyakorlat.create({
                        data: {
                            edzes_id: edzes.edzes_id,
                            gyakorlat_id: gyakorlat.gyakorlat_id,
                            szettek: { create: sets },
                        },
                    });

                    console.log(`Added exercise (${gyakorlat.gyakorlat_id}) to workout ${edzes.edzes_id}`);

                    let userGyakorlat = await prisma.user_Gyakorlat.findUnique({
                        where: {
                            user_id_gyakorlat_id: {
                                user_id: user.user_id,
                                gyakorlat_id: gyakorlat.gyakorlat_id,
                            },
                        },
                    });

                    const maxWeight = Math.max(...sets.map(s => s.weight));
                    const lastSet = sets[sets.length - 1];

                    if (!userGyakorlat) {
                        userGyakorlat = await prisma.user_Gyakorlat.create({
                            data: {
                                user_id: user.user_id,
                                gyakorlat_id: gyakorlat.gyakorlat_id,
                                personal_best: maxWeight,
                                last_weight: lastSet.weight,
                                last_reps: lastSet.reps,
                                total_sets: numSets,
                            },
                        });

                        console.log(`Created new user_Gyakorlat for user ${user.user_id}, exercise ${gyakorlat.gyakorlat_id}`);
                    } else {
                        userGyakorlat = await prisma.user_Gyakorlat.update({
                            where: {
                                user_id_gyakorlat_id: {
                                    user_id: user.user_id,
                                    gyakorlat_id: gyakorlat.gyakorlat_id,
                                },
                            },
                            data: {
                                personal_best: maxWeight > (userGyakorlat.personal_best || 0) ? maxWeight : userGyakorlat.personal_best,
                                last_weight: lastSet.weight,
                                last_reps: lastSet.reps,
                                total_sets: { increment: numSets },
                            },
                        });

                        console.log(`Updated user_Gyakorlat for user ${user.user_id}, exercise ${gyakorlat.gyakorlat_id}`);
                    }

                    for (const set of sets) {
                        await prisma.user_Gyakorlat_History.create({
                            data: {
                                user_id: user.user_id,
                                gyakorlat_id: gyakorlat.gyakorlat_id,
                                weight: set.weight,
                                reps: set.reps,
                                date: workoutDate,
                                edzes_id: edzes.edzes_id,
                            },
                        });
                    }

                }
            }
        }

        console.log("Seeding process completed successfully!");
    } catch (error) {
        console.error("Error during seeding:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
