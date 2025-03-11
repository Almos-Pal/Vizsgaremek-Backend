import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { CreateEdzesDto } from './dto/create-edzes.dto';
import { UpdateEdzesDto } from './dto/update-edzes.dto';
import { PrismaService } from 'src/prisma.service';
import { AddEdzesGyakorlatDto } from './dto/add-edzes-gyakorlat.dto';
import { AddEdzesGyakorlatSetDto } from './dto/add-edzes-gyakorlat-set.dto';
import { UpdateEdzesSetDto } from './dto/update-edzes-set.dto';
import { PaginationHelper } from '../common/helpers/pagination.helper';
import { GetEdzesekQueryDto } from './dto/get-edzesek.dto';
import { error } from 'console';
import { isDate, isNumber } from 'class-validator';

@Injectable()
export class EdzesService {
  constructor(private readonly db: PrismaService) { }

  async create(createEdzesDto: CreateEdzesDto) {
    // Ellenőrizzük, hogy létezik-e a felhasználó
    const user = await this.db.user.findUnique({
      where: { user_id: createEdzesDto.user_id }
    });

    if (!user) {
      throw new NotFoundException(`A felhasználó (ID: ${createEdzesDto.user_id}) nem található.`);

    }

    // Létrehozzuk az edzést
    const edzes = await this.db.edzes.create({
      data: {
        edzes_neve: createEdzesDto.edzes_neve,
        datum: createEdzesDto.datum ? new Date(createEdzesDto.datum) : new Date(),
        user: { connect: { user_id: createEdzesDto.user_id } },
        ido: createEdzesDto.ido
      },
      include: {
        gyakorlatok: {
          include: {
            gyakorlat: true,
            szettek: true
          }
        }
      }
    });

    // Kiszűrjük a user adatokat
    const { user_id, ...result } = edzes;
    return result;
  }

  async addGyakorlatToEdzes(
    edzesId: number,
    userId: number,
    gyakorlatDto: AddEdzesGyakorlatDto
  ) {
    try {
      // Ellenőrizzük, hogy létezik-e az edzés és a felhasználóhoz tartozik-e
      const edzes = await this.db.edzes.findUnique({
        where: {
          edzes_id: edzesId,
          user_id: userId
        }
      });

      if (!edzes) {
        throw new NotFoundException(`Az edzés (ID: ${edzesId}) nem található, vagy nem tartozik a(z) ${userId} felhasználóhoz.`);
      }

      // Ellenőrizzük, hogy létezik-e a gyakorlat
      const gyakorlat = await this.db.gyakorlat.findUnique({
        where: { gyakorlat_id: gyakorlatDto.gyakorlat_id }
      });

      if (!gyakorlat) {
        throw new NotFoundException(`A gyakorlat (ID: ${gyakorlatDto.gyakorlat_id}) nem található.`);

      }

      // Ellenőrizzük, hogy a gyakorlat nincs-e már hozzáadva az edzéshez
      const existingGyakorlat = await this.db.edzes_Gyakorlat.findUnique({
        where: {
          edzes_id_gyakorlat_id: {
            edzes_id: edzesId,
            gyakorlat_id: gyakorlatDto.gyakorlat_id
          }
        }
      });

      if (existingGyakorlat) {
        throw new ConflictException(`A gyakorlat (ID: ${gyakorlatDto.gyakorlat_id}) már hozzá van adva az edzéshez (ID: ${edzesId}).`);
      }

      // Létrehozzuk az edzés-gyakorlat kapcsolatot
      const edzesGyakorlat = await this.db.edzes_Gyakorlat.create({
        data: {
          edzes: { connect: { edzes_id: edzesId } },
          gyakorlat: { connect: { gyakorlat_id: gyakorlatDto.gyakorlat_id } }
        }
      });

      // Lekérjük a frissített edzést
      const updatedEdzes = await this.db.edzes.findUnique({
        where: { edzes_id: edzesId },
        include: {
          gyakorlatok: {
            include: {
              gyakorlat: true,
              szettek: true
            }
          }
        }
      });

      // Kiszűrjük a user adatokat
      const { user_id, ...result } = updatedEdzes;
      return result;

    } catch (error) {
      if (error instanceof NotFoundException ||
        error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Hiba történt a gyakorlat hozzáadása során az edzéshez: ' + error.message);

    }
  }

  async addSetToEdzesGyakorlat(
    edzesId: number,
    userId: number,
    gyakorlatId: number,
    setDto: AddEdzesGyakorlatSetDto
  ) {
    try {
      // Ellenőrizzük, hogy létezik-e az edzés és a felhasználóhoz tartozik-e
      const edzes = await this.db.edzes.findUnique({
        where: {
          edzes_id: edzesId,
          user_id: userId
        }
      });

      if (!edzes) {
        throw new NotFoundException(`Az edzés (ID: ${edzesId}) nem található, vagy nem tartozik a(z) ${userId} felhasználóhoz.`);
      }

      // Ellenőrizzük, hogy létezik-e az edzés-gyakorlat kapcsolat
      const edzesGyakorlat = await this.db.edzes_Gyakorlat.findUnique({
        where: {
          edzes_id_gyakorlat_id: {
            edzes_id: edzesId,
            gyakorlat_id: gyakorlatId
          }
        },
        include: {
          szettek: true
        }
      });

      if (!edzesGyakorlat) {
        throw new NotFoundException(`A gyakorlat  (ID:${gyakorlatId}) nem található  vagy nem tartozik a(z)${edzesId} edzéshez.`);
      }

      // Ellenőrizzük, hogy létezik-e már ilyen szettszám
      const existingSet = edzesGyakorlat.szettek.find(
        set => set.set_szam === setDto.set_szam
      );

      if (existingSet) {
        throw new ConflictException(`A (szett: ${setDto.set_szam}) már létezik a gyakorlatban az edzésben`);
      }

      const result = await this.db.$transaction(async (prisma) => {
        // Létrehozzuk a szettet
        await prisma.edzes_Gyakorlat_Set.create({
          data: {
            edzes_gyakorlat: {
              connect: {
                edzes_id_gyakorlat_id: {
                  edzes_id: edzesId,
                  gyakorlat_id: gyakorlatId
                }
              }
            },
            set_szam: setDto.set_szam,
            weight: setDto.weight,
            reps: setDto.reps
          }
        });

        // Létrehozunk egy history bejegyzést az edzés dátumával
        await prisma.user_Gyakorlat_History.create({
          data: {
            weight: setDto.weight,
            reps: setDto.reps,
            date: edzes.datum,
            edzes: {
              connect: {
                edzes_id: edzesId
              }
            },
            user_gyakorlat: {
              connectOrCreate: {
                where: {
                  user_id_gyakorlat_id: {
                    user_id: userId,
                    gyakorlat_id: gyakorlatId
                  }
                },
                create: {
                  user: {
                    connect: {
                      user_id: userId
                    }
                  },
                  gyakorlat: {
                    connect: {
                      gyakorlat_id: gyakorlatId
                    }
                  },
                  personal_best: setDto.weight,
                  last_weight: setDto.weight,
                  last_reps: setDto.reps,
                  total_sets: 1
                }
              }
            }
          }
        });

        // Frissítjük a user-gyakorlat statisztikákat
        const userGyakorlat = await prisma.user_Gyakorlat.findUnique({
          where: {
            user_id_gyakorlat_id: {
              user_id: userId,
              gyakorlat_id: gyakorlatId
            }
          }
        });

        if (userGyakorlat) {
          await prisma.user_Gyakorlat.update({
            where: {
              user_id_gyakorlat_id: {
                user_id: userId,
                gyakorlat_id: gyakorlatId
              }
            },
            data: {
              last_weight: setDto.weight,
              last_reps: setDto.reps,
              personal_best: userGyakorlat.personal_best > setDto.weight ?
                userGyakorlat.personal_best : setDto.weight,
              total_sets: {
                increment: 1
              }
            }
          });
        }

        // Lekérjük a frissített edzést
        const updatedEdzes = await prisma.edzes.findUnique({
          where: { edzes_id: edzesId },
          include: {
            gyakorlatok: {
              include: {
                gyakorlat: true,
                szettek: true
              }
            }
          }
        });

        return updatedEdzes;
      });

      // Kiszűrjük a user adatokat
      const { user_id, ...finalResult } = result;
      return finalResult;

    } catch (error) {
      if (error instanceof NotFoundException ||
        error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Sikertelen a szett hozzáadása a gyakorlathoz: ' + error.message);
    }
  }

  async updateSet(
    edzesId: number,
    userId: number,
    gyakorlatId: number,
    setId: number,
    updateDto: UpdateEdzesSetDto
  ) {
    try {
      // Ellenőrizzük, hogy létezik-e az edzés és a felhasználóhoz tartozik-e
      const edzes = await this.db.edzes.findUnique({
        where: {
          edzes_id: edzesId,
          user_id: userId
        }
      });

      if (!edzes) {
        throw new NotFoundException(`Az edzés (ID: ${edzesId}) nem található, vagy nem tartozik a(z) ${userId} felhasználóhoz.`);
      }

      // Ellenőrizzük, hogy létezik-e a szett
      const set = await this.db.edzes_Gyakorlat_Set.findFirst({
        where: {
          id: setId,
          edzes_gyakorlat: {
            edzes_id: edzesId,
            gyakorlat_id: gyakorlatId
          }
        }
      });

      if (!set) {
        throw new NotFoundException(`A megadott szett (setID: ${setId}) nem található az edzésben (edzesID: ${edzesId}) a gyakorlatnál (gyakorlatID: ${gyakorlatId}).`);
      }

      // Find the existing history record for this set
      const existingHistory = await this.db.user_Gyakorlat_History.findFirst({
        where: {
          user_id: userId,
          gyakorlat_id: gyakorlatId,
          date: edzes.datum,
          weight: set.weight,
          reps: set.reps
        }
      });

      // Get the user_gyakorlat record to check personal best
      const userGyakorlat = await this.db.user_Gyakorlat.findUnique({
        where: {
          user_id_gyakorlat_id: {
            user_id: userId,
            gyakorlat_id: gyakorlatId
          }
        }
      });

      // Update everything in a transaction
      const result = await this.db.$transaction(async (prisma) => {
        // Update the set
        const updatedSet = await prisma.edzes_Gyakorlat_Set.update({
          where: { id: setId },
          data: {
            weight: updateDto.weight,
            reps: updateDto.reps
          }
        });

        // Update or create history record
        if (existingHistory) {
          await prisma.user_Gyakorlat_History.update({
            where: { id: existingHistory.id },
            data: {
              weight: updateDto.weight,
              reps: updateDto.reps
            }
          });
        } else {
          await prisma.user_Gyakorlat_History.create({
            data: {
              user_gyakorlat: {
                connect: {
                  user_id_gyakorlat_id: {
                    user_id: userId,
                    gyakorlat_id: gyakorlatId
                  }
                }
              },
              edzes: {
                connect: {
                  edzes_id: edzesId
                }
              },
              weight: updateDto.weight,
              reps: updateDto.reps,
              date: edzes.datum
            }
          });
        }

        // Update user_gyakorlat stats including personal best
        if (userGyakorlat) {
          const newPersonalBest = Math.max(
            userGyakorlat.personal_best || 0,
            updateDto.weight
          );

          await prisma.user_Gyakorlat.update({
            where: {
              user_id_gyakorlat_id: {
                user_id: userId,
                gyakorlat_id: gyakorlatId
              }
            },
            data: {
              last_weight: updateDto.weight,
              last_reps: updateDto.reps,
              personal_best: newPersonalBest
            }
          });
        } else {
          // If user_gyakorlat doesn't exist, create it
          await prisma.user_Gyakorlat.create({
            data: {
              user: { connect: { user_id: userId } },
              gyakorlat: { connect: { gyakorlat_id: gyakorlatId } },
              personal_best: updateDto.weight,
              last_weight: updateDto.weight,
              last_reps: updateDto.reps,
              total_sets: 1
            }
          });
        }

        // Return updated edzes
        return prisma.edzes.findUnique({
          where: { edzes_id: edzesId },
          include: {
            gyakorlatok: {
              include: {
                gyakorlat: true,
                szettek: true
              }
            }
          }
        });
      });

      // Kiszűrjük a user adatokat
      const { user_id, ...finalResult } = result;
      return finalResult;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Hiba történt a szett frissítése során: ' + error.message);
    }
  }

  async removeSet(edzesId: number, userId: number, gyakorlatId: number, setId: number) {
    try {
      // Check if the edzes exists and belongs to the user
      const edzes = await this.db.edzes.findUnique({
        where: { edzes_id: edzesId },
        include: {
          gyakorlatok: {
            include: {
              szettek: true
            }
          }
        }
      });

      if (!edzes) {
        throw new NotFoundException(`Az edzés (ID: ${edzesId}) nem található.`);
      }

      if (edzes.user_id !== userId) {
        throw new ForbiddenException('Nincs jogosultsága az edzés módosításához.');
      }

      // Get the set to be deleted
      const set = await this.db.edzes_Gyakorlat_Set.findFirst({
        where: {
          id: setId,
          edzes_id: edzesId,
          gyakorlat_id: gyakorlatId
        }
      });

      if (!set) {
        throw new NotFoundException(`A szett nem található.`);
      }

      // Find and delete the history entry for this specific set
      const historyEntry = await this.db.user_Gyakorlat_History.findFirst({
        where: {
          user_id: userId,
          gyakorlat_id: gyakorlatId,
          weight: set.weight,
          reps: set.reps,
          date: edzes.datum
        }
      });

      if (historyEntry) {
        await this.db.user_Gyakorlat_History.delete({
          where: { id: historyEntry.id }
        });
      }

      // Delete the set
      await this.db.edzes_Gyakorlat_Set.delete({
        where: { id: setId }
      });

      // Update the total_sets count in user_gyakorlat
      await this.db.user_Gyakorlat.update({
        where: {
          user_id_gyakorlat_id: {
            user_id: userId,
            gyakorlat_id: gyakorlatId
          }
        },
        data: {
          total_sets: {
            decrement: 1
          }
        }
      });

      return { message: 'A szett sikeresen törölve.' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Hiba történt a szett törlése közben: ' + error.message);
    }
  }

  private async getLatestGyakorlatHistory(gyakorlatId: number, user_id: number, edzesDate: Date) {
    const edzesStartOfDay = new Date(edzesDate);
    edzesStartOfDay.setHours(0, 0, 0, 0);
    const latestHistory = await this.db.user_Gyakorlat_History.findFirst({
      where: {
        gyakorlat_id: gyakorlatId,
        user_id: user_id,
        date: {
          lt: edzesStartOfDay 
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    if (!latestHistory) {
      return [];
    }

    // Beállítjuk az elejét és a végét az adott napnak
    const startOfDay = new Date(latestHistory.date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(latestHistory.date);
    endOfDay.setHours(23, 59, 59, 999);

    // Lekérjük az összes múltbeli adatot, biztosítva, hogy az edzésnél régebben vannak
    return this.db.user_Gyakorlat_History.findMany({
      where: {
        gyakorlat_id: gyakorlatId,
        user_id: user_id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
          lt: edzesStartOfDay
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
  }

  async findAll(query: GetEdzesekQueryDto) {
    const { skip, take, page, limit, user_id } = PaginationHelper.getPaginationOptions(query);
    const { gyakorlat_id } = query;
    const where = {
      ...(user_id ? { user_id } : {}),
      ...(gyakorlat_id ? { gyakorlatok: { some: { gyakorlat_id } } } : {})
    };

    const [edzesek, total] = await Promise.all([
      this.db.edzes.findMany({
        where,
        skip,
        take,
        include: {
          gyakorlatok: {
            include: {
              gyakorlat: {
                include: {
                  izomcsoportok: {
                    include: {
                      izomcsoport: true
                    }
                  }
                }
              },
              szettek: {
                orderBy: {
                  set_szam: 'asc'
                }
              }
            }
          }
        },
        orderBy: {
          datum: 'desc'
        }
      }),
      this.db.edzes.count({ where })
    ]);

    // Csak a szettek kiiratása adatok nélkül
    const enrichedEdzesek = edzesek.map((edzes) => {
      const gyakorlatokWithTotals = edzes.gyakorlatok.map((gyakorlatConn) => {
        const total_sets = gyakorlatConn.szettek.length;
        return {
          ...gyakorlatConn,
          total_sets
        };
      });

      return {
        ...edzes,
        gyakorlatok: gyakorlatokWithTotals
      };
    });

    // Kiszűrjük a user adatokat
    const items = enrichedEdzesek.map(({ user_id, ...edzes }) => edzes);

    return {
      items,
      meta: PaginationHelper.createMeta(page, limit, total)
    };
  }

  async findOne(id: number) {

    const edzes = await this.db.edzes.findUnique({
      where: { edzes_id: id },
      include: {
        gyakorlatok: {
          include: {
            gyakorlat: {
              include: {
                izomcsoportok: {
                  include: {
                    izomcsoport: true
                  }
                }
              }
            },
            szettek: {
              orderBy: {
                set_szam: 'asc'
              }
            }
          }
        }
      }
    });

    if (!edzes) {
      throw new NotFoundException(`Az edzés (ID: ${id}) nem található.`);

    }

    const gyakorlatokWithHistory = await Promise.all(
      edzes.gyakorlatok.map(async (gyakorlatConn) => {
        const total_sets = gyakorlatConn.szettek.length;

        const history = await this.getLatestGyakorlatHistory(
          gyakorlatConn.gyakorlat_id,
          edzes.user_id,
          edzes.datum
        );

        return {
          ...gyakorlatConn,
          total_sets,
          previous_history: history,
          isFinalized: edzes.isFinalized
        };
      })
    );

    // Kiszűrjük a user adatokat és hozzáadjuk a gyakorlat előzményeket
    const { user_id, ...result } = {
      ...edzes,
      gyakorlatok: gyakorlatokWithHistory
    };

    return result;
  }

  async update(id: number, updateEdzesDto: UpdateEdzesDto) {
    const edzes = await this.db.edzes.findUnique({
      where: { edzes_id: id }
    });

    if (!edzes) {
      throw new NotFoundException(`Az edzés (ID: ${id}) nem található.`);

    }

    const updatedEdzes = await this.db.edzes.update({
      where: { edzes_id: id },
      data: {
        edzes_neve: updateEdzesDto.edzes_neve,
        datum: updateEdzesDto.datum ? new Date(updateEdzesDto.datum) : undefined,
        ido: updateEdzesDto.ido
      },
      include: {
        gyakorlatok: {
          include: {
            gyakorlat: true,
            szettek: true
          }
        }
      }
    });

    // Kiszűrjük a user adatokat
    const { user_id, ...result } = updatedEdzes;
    return result;
  }

  async deleteGyakorlatFromEdzes(edzesId: number, gyakorlatId: number, userId: number) {
    try {
      const edzes = await this.db.edzes.findUnique({ where: { edzes_id: edzesId } });

      if (!edzes) {
        throw new NotFoundException(`Az edzés (ID: ${edzesId}) nem található.`);
      }

      // Ellenőrizzük, hogy a gyakorlat hozzá van-e adva az edzéshez
      const edzesGyakorlat = await this.db.edzes_Gyakorlat.findUnique({
        where: {
          edzes_id_gyakorlat_id: {
            edzes_id: edzesId,
            gyakorlat_id: gyakorlatId
          }
        }
      });

      if (!edzesGyakorlat) {
        throw new NotFoundException(`A gyakorlat (ID: ${gyakorlatId}) nem található az edzésben (ID: ${edzesId}).`);
      }

      await this.db.$transaction(async (prisma) => {
        // Töröljük a szetteket
        await prisma.edzes_Gyakorlat_Set.deleteMany({
          where: {
            edzes_gyakorlat: {
              edzes_id: edzesId,
              gyakorlat_id: gyakorlatId
            }
          }
        });

        // Töröljük az edzés-gyakorlat kapcsolatot
        await prisma.edzes_Gyakorlat.delete({
          where: {
            edzes_id_gyakorlat_id: {
              edzes_id: edzesId,
              gyakorlat_id: gyakorlatId
            }
          }
        });

        // Töröljük a history bejegyzéseket
        // await prisma.user_Gyakorlat_History.deleteMany({
        //   where: {
        //     user_id: userId,
        //     gyakorlat_id: gyakorlatId
        //   }
        // });
      });

      return { message: "Gyakorlat sikeresen törölve az edzésből" };
    } catch (error) {
      throw new BadRequestException('Hiba történt az edzés törlése során: ' + error.message);
    }
  }

  async remove(id: number) {
    try {
      const edzes = await this.db.edzes.findUnique({
        where: { edzes_id: id },
        include: {
          gyakorlatok: {
            include: {
              szettek: true
            }
          }
        }
      });

      if (!edzes) {
        throw new NotFoundException(`Az edzés (ID: ${id}) nem található.`);
      }

      // Delete all related records in a transaction
      await this.db.$transaction(async (prisma) => {
        // Find and delete history entries for this workout's date and exercises
        const historyEntries = await prisma.user_Gyakorlat_History.findMany({
          where: {
            user_id: edzes.user_id,
            gyakorlat_id: {
              in: edzes.gyakorlatok.map(g => g.gyakorlat_id)
            },
            date: edzes.datum
          }
        });

        if (historyEntries.length > 0) {
          await prisma.user_Gyakorlat_History.deleteMany({
            where: {
              id: {
                in: historyEntries.map(h => h.id)
              }
            }
          });
        }

        // Delete all sets for this workout
        await prisma.edzes_Gyakorlat_Set.deleteMany({
          where: {
            edzes_id: id
          }
        });

        // Update total_sets count for each gyakorlat
        for (const gyakorlat of edzes.gyakorlatok) {
          await prisma.user_Gyakorlat.update({
            where: {
              user_id_gyakorlat_id: {
                user_id: edzes.user_id,
                gyakorlat_id: gyakorlat.gyakorlat_id
              }
            },
            data: {
              total_sets: {
                decrement: gyakorlat.szettek.length
              }
            }
          });
        }

        // Delete edzes-gyakorlat connections
        await prisma.edzes_Gyakorlat.deleteMany({
          where: { edzes_id: id }
        });

        // Finally delete the edzes itself
        await prisma.edzes.delete({
          where: { edzes_id: id }
        });
      });

      return { message: 'Az edzés sikeresen törölve.' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Hiba történt az edzés törlése közben: ' + error.message);
    }
  }

  async getEdzesIzomcsoportok(user_id?: number) {
    try {
      if (!user_id) {
        throw new BadRequestException("Hiányzik az user_id");
      }

      const edzesek = await this.db.edzes.findMany({
        where: { user_id },
        include: {
          gyakorlatok: {
            include: {
              gyakorlat: {
                include: {
                  izomcsoportok: {
                    include: { izomcsoport: true }
                  }
                }
              }
            }
          }
        }
      });

      if (edzesek.length === 0) {
        throw new Error("Nincsenek edzések az adott felhasználóhoz");
      }

      const izomcsoportMap = new Map<number, string>();
      const foIzomcsoportMap = new Map<number, string>();

      edzesek.forEach(edzes => {
        edzes.gyakorlatok.forEach(gyakorlatConn => {
          const gyakorlat = gyakorlatConn.gyakorlat;

          if (gyakorlat.fo_izomcsoport) {
            foIzomcsoportMap.set(gyakorlat.fo_izomcsoport, "Fő izomcsoport");
          }

          gyakorlat.izomcsoportok.forEach(conn => {
            izomcsoportMap.set(conn.izomcsoport.izomcsoport_id, conn.izomcsoport.nev);
          });
        });
      });


      return {
        izomcsoportok: Array.from(izomcsoportMap.keys()),
        fo_izomcsoportok: Array.from(foIzomcsoportMap.keys())
      };
    } catch (error) {
      throw new BadRequestException('Hiba az izomcsoportok lekérése során: ' + error.message);
    }
  }


  async removeUserGyakorlat(userId: number, gyakorlatId: number) {
    try {
      await this.db.$transaction(async (prisma) => {
        // Először töröljük az összes history bejegyzést
        await prisma.user_Gyakorlat_History.deleteMany({
          where: {
            user_id: userId,
            gyakorlat_id: gyakorlatId
          }
        });

        // Töröljük az összes szettet az összes edzésből
        await prisma.edzes_Gyakorlat_Set.deleteMany({
          where: {
            edzes_gyakorlat: {
              gyakorlat_id: gyakorlatId,
              edzes: {
                user_id: userId
              }
            }
          }
        });

        // Töröljük az edzés-gyakorlat kapcsolatokat
        await prisma.edzes_Gyakorlat.deleteMany({
          where: {
            gyakorlat_id: gyakorlatId,
            edzes: {
              user_id: userId
            }
          }
        });

        // Végül töröljük a user-gyakorlat kapcsolatot
        await prisma.user_Gyakorlat.delete({
          where: {
            user_id_gyakorlat_id: {
              user_id: userId,
              gyakorlat_id: gyakorlatId
            }
          }
        });
      });

      return { message: 'Gyakorlat sikeresen törölve a felhasználok közül' };

    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`A megadott gyakorlat nem található a felhasználónál (user: ${userId}, gyakorlat: ${gyakorlatId}).`);
      }
      throw new BadRequestException('Hiba történt a gyakorlat eltávolítása közben: ' + error.message);
    }

  }

  async changeEdzesFinalizedStatus(edzesId: number, userId: number, finalized: boolean) {
    try {
      const edzes = await this.db.edzes.findUnique({
        where: {
          edzes_id: edzesId,
          user_id: userId
        }
      });

      if (!edzes) {
        throw new NotFoundException(`Az edzés (ID: ${edzesId}) nem található, vagy nem tartozik a(z) ${userId} felhasználóhoz.`);
      }

      const updatedEdzes = await this.db.edzes.update({
        where: { edzes_id: edzesId },
        data: {
          isFinalized: finalized
        }
      });

      // Kiszűrjük a user adatokat
      const { user_id, ...result } = updatedEdzes;
      return result;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Hiba történt az edzés állapotának módosítása során: ' + error.message);
    }
  }
  



  async findManyByDate(
    startDate: string,
    endDate: string,
    query: GetEdzesekQueryDto,
    type: "week" | "month" | "halfyear" | "all"
  ) {
    const { skip, take, page, limit, user_id } = PaginationHelper.getPaginationOptions(query);
    let edzesWhere = {};
    const now = new Date();
  
   
    if (!(type === "week" || type === "month" || type === "halfyear" || type === "all")) {
      try {
        if (!isDate(new Date(startDate))) throw new Error();
      } catch (error) {
        throw new BadRequestException("Hibás vagy nincs megadva az startDate");
      }
      try {
        if (!isDate(new Date(endDate))) throw new Error();
      } catch (error) {
        throw new BadRequestException("Hibás vagy nincs megadva az endDate");
      }
  
      edzesWhere = {
        AND: {
          ...(user_id ? { user_id } : {}),
          datum: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      };
    } else {
      let dateOffset = 0;
      if (type === "week") dateOffset = 7;
      else if (type === "month") dateOffset = 30;
      else if (type === "halfyear") dateOffset = 180;
  
      if (type === "all") {
        edzesWhere = {
          ...(user_id ? { user_id } : {}),
        };
      } else {
        edzesWhere = {
          AND: {
            ...(user_id ? { user_id } : {}),
            datum: {
              gte: new Date(now.getTime() - dateOffset * 24 * 60 * 60 * 1000),
              lte: now,
            },
          },
        };
      }
    }
  
  
    const totalWeightResult = await this.db.edzes_Gyakorlat_Set.aggregate({
      _sum: { weight: true },
      where: {
        edzes_gyakorlat: {
          edzes: edzesWhere,
        },
      },
    });
    const totalWeight = totalWeightResult._sum.weight || 0;
  

    const [edzesek, total] = await Promise.all([
      this.db.edzes.findMany({
        where: edzesWhere,
        skip,
        take,
        include: {
          gyakorlatok: {
            include: {
              gyakorlat: {
                include: {
                  izomcsoportok: {
                    include: {
                      izomcsoport: true,
                    },
                  },
                },
              },
              szettek: {
                orderBy: {
                  set_szam: "asc",
                },
              },
            },
          },
        },
        orderBy: {
          datum: "desc",
        },
      }),
      this.db.edzes.count({ where: edzesWhere }),
    ]);
  

    const izomcsoportCounts: Record<number, number> = {};
    const enrichedEdzesek = edzesek.map((edzes) => {
      const gyakorlatokWithTotals = edzes.gyakorlatok
        .map((gyakorlatConn) => {
          const total_sets = gyakorlatConn.szettek.length;
          if (total_sets === 0) return null; 
  
    
          const gyakorlat = gyakorlatConn.gyakorlat;
          if (gyakorlat.izomcsoportok && gyakorlat.izomcsoportok.length > 0) {
            gyakorlat.izomcsoportok.forEach((group) => {
              const muscleId = group.izomcsoport.izomcsoport_id;
              izomcsoportCounts[muscleId] = (izomcsoportCounts[muscleId] || 0) + 1;
            });
          } else if (gyakorlat.fo_izomcsoport) {
            const muscleId = gyakorlat.fo_izomcsoport;
            izomcsoportCounts[muscleId] = (izomcsoportCounts[muscleId] || 0) + 1;
          }
  
          return { ...gyakorlatConn, total_sets };
        })
        .filter(Boolean); 
  
      return { ...edzes, gyakorlatok: gyakorlatokWithTotals };
    });
  
    return {
      items: enrichedEdzesek.map(({ user_id, ...edzes }) => edzes),
      meta: {
        ...PaginationHelper.createMeta(page, limit, total),
        izomcsoportCounts,
        totalWeight, 
      },
    };
  }
  
  


  async findOneByDate(user_Id: number, date: string) {
    try {
      if (!isNumber(user_Id)) {
        throw new BadRequestException("Hibás a user_id formátuma");
      }
      if (!isDate(new Date(date))) {
        throw new BadRequestException("Hibás a dátum formátuma");
      }

      const givenDate = new Date(date);
      const startDate = startOfDay(givenDate);
      const endDate = endOfDay(givenDate);

      const edzes = await this.db.edzes.findMany({
        where: {
          user_id: user_Id,
          datum: {
            gte: startDate,
            lt: endDate,
          },
        },
        include: {
          gyakorlatok: {
            include: {
              gyakorlat: {
                include: {
                  izomcsoportok: {
                    include: {
                      izomcsoport: true,
                    },
                  },
                },
              },
              szettek: {
                orderBy: {
                  set_szam: "asc",
                },
              },
            },
          },
        },
      });

      if (edzes.length === 0) {
        throw new NotFoundException(`Az edzés (Dátum: ${date}) nem található.`);
      }

      const gyakorlatokWithHistory = await Promise.all(
        edzes[0].gyakorlatok.map(async (gyakorlatConn) => {
          const total_sets = gyakorlatConn.szettek.length;

        const history = await this.getLatestGyakorlatHistory(
          gyakorlatConn.gyakorlat_id,
          edzes[0].user_id,

          edzes[0].datum
        );

          return {
            ...gyakorlatConn,
            total_sets,
            previous_history: history,
          };
        })
      );

      return {
        ...edzes[0],
        gyakorlatok: gyakorlatokWithHistory,
      };
    } catch (error) {
      console.error(error);

      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException("Hiba történt az edzés lekérdezésekor.");
    }
  }

async findTen(user_Id:number,gyakorlat_id:number){
  try {
    if (!isNumber(user_Id)) {
      throw new BadRequestException("Hibás a user_id formátuma");
    }

    const edzesek = await this.db.edzes.findMany({
      where: {
        user_id: user_Id,
        gyakorlatok:{
          some:{
            gyakorlat:{
              gyakorlat_id:gyakorlat_id
            }
          }
        }
      },
      include: {
        gyakorlatok: {
          include: {
            gyakorlat: {              
              include: {
                izomcsoportok: {
                  include: {
                    izomcsoport: true,
                  },
                },
              },
            },
            szettek: {
              orderBy: {
                set_szam: "asc",
              },
            },
          },
        },
      },
    });

    if (edzesek.length === 0) {
      throw new NotFoundException(`Az edzés nem található.`);
    }

    
          const sortedEdzesek = edzesek.sort((a, b) => {
            return b.datum.getTime() - a.datum.getTime();});
          


    const enrichedEdzesek = sortedEdzesek.slice(0,10).map((edzes) => {
      const gyakorlatokWithTotals = edzes.gyakorlatok.map((gyakorlatConn) => {
        const total_sets = gyakorlatConn.szettek.length;
        return {
          ...gyakorlatConn,
          total_sets
        };
      });
     return {
        ...edzes,
        gyakorlatok: gyakorlatokWithTotals
      };
    });
    const items = enrichedEdzesek.map(({ user_id, ...edzes }) => edzes);


    return items;

  } catch (error) {
    console.error(error); 

    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      throw error; 
    }

    throw new InternalServerErrorException("Hiba történt az edzés lekérdezésekor.");
  }


}

}
function startOfDay(givenDate: Date): Date {
  const start = new Date(givenDate);
  start.setHours(0, 0, 0, 0);
  return start;
}

function endOfDay(givenDate: Date): Date {
  const end = new Date(givenDate);
  end.setHours(23, 59, 59, 999);
  return end;
}

