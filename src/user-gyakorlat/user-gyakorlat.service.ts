import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserGyakorlatDto } from './dto/create-user-gyakorlat.dto';
import { CreateUserGyakorlatHistoryDto } from './dto/create-user-gyakorlat-history.dto';
import { GetUserGyakorlatokQueryDto, UserGyakorlatokResponseDto } from './dto/user-gyakorlatok.dto';
import { PaginationHelper } from '../common/helpers/pagination.helper';
import { UserGyakorlatNotFoundDto } from '../common/dto/not-found.dto';

@Injectable()
export class UserGyakorlatService {
  constructor(private prisma: PrismaService) {}

  async createUserGyakorlat(createUserGyakorlatDto: CreateUserGyakorlatDto) {
    const { gyakorlat_id, user_id } = createUserGyakorlatDto;

    const existing = await this.prisma.user_Gyakorlat.findUnique({
      where: {
        user_id_gyakorlat_id: {
          user_id,
          gyakorlat_id
        }
      }
    });

    if (existing) {
      throw new BadRequestException('Ez a gyakorlat már hozzá van rendelve a felhasználóhoz');
    }

    const [gyakorlat, user] = await Promise.all([
      this.prisma.gyakorlat.findUnique({ where: { gyakorlat_id } }),
      this.prisma.user.findUnique({ where: { user_id } })
    ]);

    if (!gyakorlat || !user) {
      throw new NotFoundException('A gyakorlat vagy a felhasználó nem található');
    }

    return this.prisma.user_Gyakorlat.create({
      data: {
        user: {
          connect: { user_id }
        },
        gyakorlat: {
          connect: { gyakorlat_id }
        },
        personal_best: createUserGyakorlatDto.personal_best || null,
        last_weight: createUserGyakorlatDto.last_weight || null,
        last_reps: createUserGyakorlatDto.last_reps || null,
        total_sets: 0
      }
    });
  }

  async createUserGyakorlatHistory(createHistoryDto: CreateUserGyakorlatHistoryDto) {
    const { gyakorlat_id, user_id, weight, reps, edzes_id } = createHistoryDto;

    const userGyakorlat = await this.prisma.user_Gyakorlat.findUnique({
      where: {
        user_id_gyakorlat_id: {
          user_id,
          gyakorlat_id
        }
      }
    });

    if (!userGyakorlat) {
      await this.createUserGyakorlat({
        gyakorlat_id,
        user_id,
        personal_best: weight,
        last_weight: weight,
        last_reps: reps
      });
    }

    // Check if the workout exists
    const edzes = await this.prisma.edzes.findUnique({
      where: { edzes_id }
    });

    if (!edzes) {
      throw new NotFoundException(`Az edzés (ID: ${edzes_id}) nem található.`);
    }

    // Tranzakcióban kezeljük a history létrehozását és a rekordok frissítését
    return this.prisma.$transaction(async (prisma) => {
      // History bejegyzés létrehozása
      const history = await prisma.user_Gyakorlat_History.create({
        data: {
          weight,
          reps,
          edzes: {
            connect: {
              edzes_id
            }
          },
          user_gyakorlat: {
            connect: {
              user_id_gyakorlat_id: {
                user_id,
                gyakorlat_id
              }
            }
          }
        }
      });

      await prisma.user_Gyakorlat.update({
        where: {
          user_id_gyakorlat_id: {
            user_id,
            gyakorlat_id
          }
        },
        data: {
          last_weight: weight,
          last_reps: reps,
          personal_best: userGyakorlat && userGyakorlat.personal_best && userGyakorlat.personal_best > weight ? 
            userGyakorlat.personal_best : weight,
          total_sets: {
            increment: 1
          }
        }
      });

      return history;
    });
  }
  async getUserGyakorlatok(user_id: number, query: GetUserGyakorlatokQueryDto): Promise<UserGyakorlatokResponseDto> {
    const { skip, take, page, limit } = PaginationHelper.getPaginationOptions(query);
    const { isRecord, search } = query;
  
    // Begin with a base filter using the user_id.
    const where: any = { user_id };
  
    // Add search filtering (similar to findAll) if a search term is provided.
    if (search) {
      where.gyakorlat_neve = {
        contains: search,
        mode: 'insensitive'
      };
    }
  
    if (isRecord) {
      // When isRecord is true, use a selection of specific fields.
      const [items, total] = await Promise.all([
        this.prisma.user_Gyakorlat.findMany({
          where: {
            user_id: 2,
            gyakorlat: { // Nest the filter here
              gyakorlat_neve: {
                contains: search || "",
                mode: "insensitive"
              }
            }
          },
          skip: 0,
          take: 10,
          orderBy: {
            personal_best: "desc"
          },
          select: {
            personal_best: true,
            gyakorlat: {
              select: {
                gyakorlat_neve: true,
                fo_izomcsoport: true,
                izomcsoportok: {
                  select: {
                    izomcsoport_id: true
                  }
                }
              }
            }
          }
        }),
        this.prisma.user_Gyakorlat.count({
          where: {
            user_id: 2,
            gyakorlat: { // Apply the same nested filter for counting
              gyakorlat_neve: {
                contains: search || "",
                mode: "insensitive"
              }
            }
          }
        })
      ]);
      
  
      return {
        items,
        meta: PaginationHelper.createMeta(page, limit, total)
      };
    }
  
    // Otherwise, include more detailed information along with history.
    const [items, total] = await Promise.all([
      this.prisma.user_Gyakorlat.findMany({
        where,
        skip,
        take,
        include: {
          gyakorlat: true,
          history: {
            orderBy: {
              date: 'desc'
            },
            take: 10 // Last 10 entries
          }
        }
      }),
      this.prisma.user_Gyakorlat.count({ where })
    ]);
  
    return {
      items,
      meta: PaginationHelper.createMeta(page, limit, total)
    };
  }
  
  

  // Egy konkrét user-gyakorlat részletes adatai
  async getUserGyakorlatDetails(user_id: number, gyakorlat_id: number) {
    const userGyakorlat = await this.prisma.user_Gyakorlat.findUnique({
      where: {
        user_id_gyakorlat_id: {
          user_id,
          gyakorlat_id
        }
      },
      include: {
        gyakorlat: true,
        history: {
          orderBy: {
            date: 'desc'
          }
        }
      }
    });

    if (!userGyakorlat) {
      throw new NotFoundException(new UserGyakorlatNotFoundDto(user_id, gyakorlat_id));
    }

    return userGyakorlat;
  }

  // Felhasználó gyakorlatának törlése
  async deleteUserGyakorlat(user_id: number, gyakorlat_id: number) {
    const userGyakorlat = await this.prisma.user_Gyakorlat.findUnique({
      where: {
        user_id_gyakorlat_id: {
          user_id,
          gyakorlat_id
        }
      }
    });
    

    if (!userGyakorlat) {
      throw new NotFoundException(new UserGyakorlatNotFoundDto(user_id, gyakorlat_id));
    }

    // Tranzakciókat használunk a törléshez
    return this.prisma.$transaction(async (prisma) => {
      // először a history adatokat töröljük
      await prisma.user_Gyakorlat_History.deleteMany({
        where: {
          user_id,
          gyakorlat_id
        }
      });

      // majd a user_gyakorlat adatokat
      return prisma.user_Gyakorlat.delete({
        where: {
          user_id_gyakorlat_id: {
            user_id,
            gyakorlat_id
          }
        }
      });
    });
  }

} 