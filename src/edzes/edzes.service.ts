import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateEdzesDto } from './dto/create-edzes.dto';
import { UpdateEdzesDto } from './dto/update-edzes.dto';
import { PrismaService } from 'src/prisma.service';
import { AddEdzesGyakorlatDto } from './dto/add-edzes-gyakorlat.dto';
import { AddEdzesGyakorlatSetDto } from './dto/add-edzes-gyakorlat-set.dto';
import { UpdateEdzesSetDto } from './dto/update-edzes-set.dto';
import { PaginationHelper } from '../common/helpers/pagination.helper';
import { GetEdzesekQueryDto } from './dto/get-edzesek.dto';

@Injectable()
export class EdzesService {
  constructor(private readonly db: PrismaService) {}

  async create(createEdzesDto: CreateEdzesDto) {
    // Ellenőrizzük, hogy létezik-e a felhasználó
    const user = await this.db.user.findUnique({
      where: { user_id: createEdzesDto.user_id }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${createEdzesDto.user_id} not found`);
    }

    // Létrehozzuk az edzést
    const edzes = await this.db.edzes.create({
      data: {
        edzes_neve: createEdzesDto.edzes_neve,
        datum: new Date(createEdzesDto.datum),
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
        throw new NotFoundException(`Edzés with ID ${edzesId} not found or doesn't belong to user ${userId}`);
      }

      // Ellenőrizzük, hogy létezik-e a gyakorlat
      const gyakorlat = await this.db.gyakorlat.findUnique({
        where: { gyakorlat_id: gyakorlatDto.gyakorlat_id }
      });

      if (!gyakorlat) {
        throw new NotFoundException(`Gyakorlat with ID ${gyakorlatDto.gyakorlat_id} not found`);
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
        throw new ConflictException(`Gyakorlat with ID ${gyakorlatDto.gyakorlat_id} is already added to edzés ${edzesId}`);
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
      throw new BadRequestException('Failed to add gyakorlat to edzés: ' + error.message);
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
        throw new NotFoundException(`Edzés with ID ${edzesId} not found or doesn't belong to user ${userId}`);
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
        throw new NotFoundException(`Gyakorlat with ID ${gyakorlatId} not found in edzés ${edzesId}`);
      }

      // Ellenőrizzük, hogy létezik-e már ilyen szettszám
      const existingSet = edzesGyakorlat.szettek.find(
        set => set.set_szam === setDto.set_szam
      );

      if (existingSet) {
        throw new ConflictException(`Set number ${setDto.set_szam} already exists for this gyakorlat in this edzés`);
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

        // Létrehozunk egy history bejegyzést
        await prisma.user_Gyakorlat_History.create({
          data: {
            user_gyakorlat: {
              connectOrCreate: {
                where: {
                  user_id_gyakorlat_id: {
                    user_id: userId,
                    gyakorlat_id: gyakorlatId
                  }
                },
                create: {
                  user: { connect: { user_id: userId } },
                  gyakorlat: { connect: { gyakorlat_id: gyakorlatId } },
                  personal_best: setDto.weight,
                  last_weight: setDto.weight,
                  last_reps: setDto.reps,
                  total_sets: 1
                }
              }
            },
            weight: setDto.weight,
            reps: setDto.reps
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
      throw new BadRequestException('Failed to add set to gyakorlat: ' + error.message);
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
        throw new NotFoundException(`Edzés with ID ${edzesId} not found or doesn't belong to user ${userId}`);
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
        throw new NotFoundException(`Set with ID ${setId} not found in edzés ${edzesId} for gyakorlat ${gyakorlatId}`);
      }

      // Csak a súlyt és az ismétlésszámot lehet módosítani
      const updatedSet = await this.db.edzes_Gyakorlat_Set.update({
        where: { id: setId },
        data: {
          weight: updateDto.weight,
          reps: updateDto.reps
          // set_szam nem módosítható
        }
      });

      // Frissítjük a history bejegyzést is
      await this.db.user_Gyakorlat_History.create({
        data: {
          user_gyakorlat: {
            connect: {
              user_id_gyakorlat_id: {
                user_id: userId,
                gyakorlat_id: gyakorlatId
              }
            }
          },
          weight: updateDto.weight,
          reps: updateDto.reps
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
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update set: ' + error.message);
    }
  }

  async removeSet(edzesId: number, userId: number, gyakorlatId: number, setId: number) {
    // Ellenőrizzük, hogy létezik-e az edzés és a felhasználóhoz tartozik-e
    const edzes = await this.db.edzes.findUnique({
      where: { 
        edzes_id: edzesId,
        user_id: userId
      }
    });

    if (!edzes) {
      throw new NotFoundException(`Edzés with ID ${edzesId} not found or doesn't belong to user ${userId}`);
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
      throw new NotFoundException(`Set with ID ${setId} not found in edzés ${edzesId} for gyakorlat ${gyakorlatId}`);
    }

    // Töröljük a szettet
    await this.db.edzes_Gyakorlat_Set.delete({
      where: { id: setId }
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
  }

  private async getLatestGyakorlatHistory(gyakorlatId: number) {
    // First get the latest history entry to determine the date
    const latestHistory = await this.db.user_Gyakorlat_History.findFirst({
      where: {
        gyakorlat_id: gyakorlatId
      },
      orderBy: {
        date: 'desc'
      }
    });

    if (!latestHistory) {
      return [];
    }

    // Get the start and end of that date
    const startOfDay = new Date(latestHistory.date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(latestHistory.date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all history entries from that same day
    return this.db.user_Gyakorlat_History.findMany({
      where: {
        gyakorlat_id: gyakorlatId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
  }

  async findAll(query: GetEdzesekQueryDto) {
    const { skip, take, page, limit } = PaginationHelper.getPaginationOptions(query);

    const [edzesek, total] = await Promise.all([
      this.db.edzes.findMany({
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
        }
      }),
      this.db.edzes.count()
    ]);

    // Only include total_sets in the response, no history
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
      throw new NotFoundException(`Edzés with ID ${id} not found`);
    }

    // Get history for each gyakorlat from the latest history date
    const gyakorlatokWithHistory = await Promise.all(
      edzes.gyakorlatok.map(async (gyakorlatConn) => {
        const total_sets = gyakorlatConn.szettek.length;
        
        // Get all gyakorlat history entries from the latest history's date
        const history = await this.getLatestGyakorlatHistory(
          gyakorlatConn.gyakorlat_id
        );

        return {
          ...gyakorlatConn,
          total_sets,
          previous_history: history
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
      throw new NotFoundException(`Edzés with ID ${id} not found`);
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

  async remove(id: number) {
    try {
      const edzes = await this.db.edzes.findUnique({
        where: { edzes_id: id }
      });

      if (!edzes) {
        throw new NotFoundException(`Edzés with ID ${id} not found`);
      }

      // Tranzakcióban végezzük a törlést
      await this.db.$transaction(async (prisma) => {
        // Először lekérjük az összes history bejegyzést amit törölni kell
        const historyEntries = await prisma.user_Gyakorlat_History.findMany({
          where: {
            user_id: edzes.user_id,
            gyakorlat_id: {
              in: (await prisma.edzes_Gyakorlat.findMany({
                where: { edzes_id: id },
                select: { gyakorlat_id: true }
              })).map(g => g.gyakorlat_id)
            }
          }
        });

        // Töröljük a history bejegyzéseket
        if (historyEntries.length > 0) {
          await prisma.user_Gyakorlat_History.deleteMany({
            where: {
              id: {
                in: historyEntries.map(h => h.id)
              }
            }
          });
        }

        // Töröljük a szetteket
        await prisma.edzes_Gyakorlat_Set.deleteMany({
          where: { 
            edzes_gyakorlat: {
              edzes_id: id
            }
          }
        });

        // Töröljük az edzés-gyakorlat kapcsolatokat
        await prisma.edzes_Gyakorlat.deleteMany({
          where: { edzes_id: id }
        });

        // Végül töröljük magát az edzést
        await prisma.edzes.delete({
          where: { edzes_id: id }
        });
      });

      return { message: 'Edzés successfully deleted' };

    } catch (error) {
      throw new BadRequestException('Failed to delete edzés: ' + error.message);
    }
  }

  async getEdzesIzomcsoportok() {
    const edzesek = await this.db.edzes.findMany({
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
            }
          }
        }
      }
    });

    // Összegyűjtjük az összes izomcsoportot és fő izomcsoportot
    const izomcsoportMap = new Map<number, string>();
    const foIzomcsoportMap = new Map<number, string>();

    edzesek.forEach(edzes => {
      edzes.gyakorlatok.forEach(gyakorlatConn => {
        const gyakorlat = gyakorlatConn.gyakorlat;
        
        // Fő izomcsoport hozzáadása
        if (gyakorlat.fo_izomcsoport) {
          foIzomcsoportMap.set(gyakorlat.fo_izomcsoport, 'Fő izomcsoport');
        }

        // Többi izomcsoport hozzáadása
        gyakorlat.izomcsoportok.forEach(conn => {
          const izomcsoport = conn.izomcsoport;
          izomcsoportMap.set(izomcsoport.izomcsoport_id, izomcsoport.nev);
        });
      });
    });

    return {
      izomcsoportok: Array.from(izomcsoportMap.keys()),
      fo_izomcsoportok: Array.from(foIzomcsoportMap.keys())
    };
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

      return { message: 'Gyakorlat successfully removed from user' };

    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User gyakorlat not found for user ${userId} and gyakorlat ${gyakorlatId}`);
      }
      throw new BadRequestException('Failed to remove gyakorlat from user: ' + error.message);
    }
  }
}
