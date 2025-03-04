import { PrismaClient } from "@prisma/client";
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
    try {
        // Clear existing data
        await prisma.user_Gyakorlat_History.deleteMany();
        await prisma.edzes_Gyakorlat_Set.deleteMany();
        await prisma.edzes_Gyakorlat.deleteMany();
        await prisma.edzes.deleteMany();
        await prisma.user_Gyakorlat.deleteMany();

        // Get all users except admin
        const users = await prisma.user.findMany();

        // Get all gyakorlatok
        const gyakorlatok = await prisma.gyakorlat.findMany({
            take: 10 // Limit to 10 exercises for more frequent repetition
        });

        // For each user, create workouts over time with progression
        for (const user of users) {
            // Assign 3 main exercises that will appear regularly
            const mainExercises = faker.helpers.arrayElements(gyakorlatok, 3);
            // Rest of exercises for variety
            const otherExercises = gyakorlatok.filter(g => !mainExercises.includes(g));

            // Create 10 workouts over time to show progression
            for (let i = 0; i < 10; i++) {
                const workoutDate = faker.date.between({
                    from: new Date(2024, 0, 1 + i * 7), // One week apart
                    to: new Date(2024, 0, 3 + i * 7)
                });

                const edzes = await prisma.edzes.create({
                    data: {
                        edzes_neve: faker.helpers.arrayElement([
                            'Melledzés',
                            'Hátedzés',
                            'Lábedzés',
                            'Válledzés',
                            'Teljes test edzés'
                        ]),
                        datum: workoutDate,
                        user_id: user.user_id,
                        ido: faker.number.int({ min: 45, max: 120 }) * 60,
                        isFinalized: true
                    }
                });

                // Always include 2 main exercises
                const workoutMainExercises = faker.helpers.arrayElements(mainExercises, 2);
                // Add 1-3 other random exercises
                const workoutOtherExercises = faker.helpers.arrayElements(otherExercises, faker.number.int({ min: 1, max: 3 }));
                const workoutExercises = [...workoutMainExercises, ...workoutOtherExercises];

                for (const gyakorlat of workoutExercises) {
                    // Calculate base weight with progression
                    const baseWeight = faker.number.float({ min: 20, max: 60, fractionDigits: 1 });
                    const progressionMultiplier = 1 + (i * 0.05); // 5% increase each week
                    const currentWeight = baseWeight * progressionMultiplier;

                    // Create sets for this exercise
                    const numSets = faker.number.int({ min: 3, max: 5 });
                    const sets = Array.from({ length: numSets }, (_, index) => ({
                        set_szam: index + 1,
                        weight: faker.number.float({ 
                            min: currentWeight * 0.95, 
                            max: currentWeight * 1.05, 
                            fractionDigits: 1 
                        }),
                        reps: faker.number.int({ min: 8, max: 12 })
                    }));

                    // Create edzes-gyakorlat connection with sets
                    const edzesGyakorlat = await prisma.edzes_Gyakorlat.create({
                        data: {
                            edzes_id: edzes.edzes_id,
                            gyakorlat_id: gyakorlat.gyakorlat_id,
                            szettek: {
                                create: sets
                            }
                        }
                    });

                    // Get or create user_gyakorlat first
                    let userGyakorlat = await prisma.user_Gyakorlat.findUnique({
                        where: {
                            user_id_gyakorlat_id: {
                                user_id: user.user_id,
                                gyakorlat_id: gyakorlat.gyakorlat_id
                            }
                        }
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
                                total_sets: numSets
                            }
                        });
                    } else {
                        userGyakorlat = await prisma.user_Gyakorlat.update({
                            where: {
                                user_id_gyakorlat_id: {
                                    user_id: user.user_id,
                                    gyakorlat_id: gyakorlat.gyakorlat_id
                                }
                            },
                            data: {
                                personal_best: maxWeight > (userGyakorlat.personal_best || 0) ? maxWeight : userGyakorlat.personal_best,
                                last_weight: lastSet.weight,
                                last_reps: lastSet.reps,
                                total_sets: {
                                    increment: numSets
                                }
                            }
                        });
                    }

                    // Now create history entries for each set
                    for (const set of sets) {
                        await prisma.user_Gyakorlat_History.create({
                            data: {
                                user_id: user.user_id,
                                gyakorlat_id: gyakorlat.gyakorlat_id,
                                weight: set.weight,
                                reps: set.reps,
                                date: workoutDate
                            }
                        });
                    }
                }
            }
        }

        console.log('Edzések seeding completed successfully');
    } catch (error) {
        console.error('Error during seeding:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();