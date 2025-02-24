import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
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
  constructor(private readonly db: PrismaService) {}

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
            reps: setDto.reps,
            date: edzes.datum 
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
      throw new BadRequestException('Hiba történt a szett frissítése során: ' + error.message);

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

  private async getLatestGyakorlatHistory(gyakorlatId: number, edzesDate: Date) {
    // Létrehozzuk az adott napi edzést összehasonlításra
    const edzesStartOfDay = new Date(edzesDate);
    edzesStartOfDay.setHours(0, 0, 0, 0);

    const latestHistory = await this.db.user_Gyakorlat_History.findFirst({
      where: {
        gyakorlat_id: gyakorlatId,
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

    const where = {
      ...(user_id ? { user_id } : {})
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
          edzes.datum
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

  async remove(id: number) {
    try {
      const edzes = await this.db.edzes.findUnique({
        where: { edzes_id: id }
      });

      if (!edzes) {
        throw new NotFoundException(`Az edzés (ID: ${id}) nem található.`);

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

      return { message: 'Az edzés sikeresen törölve.' };


    } catch (error) {
      throw new BadRequestException('Hiba történt az edzés törlése során: ' + error.message);

    }
  }

  async getEdzesIzomcsoportok(user_id?: number) {
    try {
      if (!user_id) {
        throw new BadRequestException("Hiányzik az user_id" );
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
  
 async findManyByDate(startDate: string, endDate: string, query: GetEdzesekQueryDto,type: "week"|"month"|"halfyear"|"all") {
  

    const { skip, take, page, limit, user_id } = PaginationHelper.getPaginationOptions(query);
    let where = {};

     
  if (!(type === "week" || type === "month" || type === "halfyear" || type === "all")){ 
    try{  
      if( !isDate(new Date(startDate)))
       throw error();
     }
     catch(error){
      throw new BadRequestException("Hibás vagy nincs megadva az startDate");
    }
     try{
      if( !isDate(new Date(endDate))){
        throw error();
      }
      
     }
     catch(error){
      throw new BadRequestException("Hibás vagy nincs megadva az endDate");
    }
      where = {AND:{
       ...(user_id ? { user_id } : {}),
       datum: {
         gte: new Date(startDate),
         lte: new Date(endDate)
       }
     } 
     };
  }
  else{

    let now = new Date();
    let date = 0;

    if(type === "week"){
      date = 7 ;
    }else if(type === "month"){
      date = 30;
    }else if(type === "halfyear"){
      date = 180;
    }
    if(type === "all"){
      where = {
        ...(user_id ? { user_id } : {}),
      };
    }
    else{
      where = {AND:{
        ...(user_id ? { user_id } : {}),
        datum: {
          gte:  new Date(now.getTime()-(date*24*60*60*1000)),
          lte: now
        },
      } 
    };
  }

  }
   
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

async findTen(user_Id:number,gyakorlat_neve:string){
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
              gyakorlat_neve:gyakorlat_neve
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


    return {
      items,
    };
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

