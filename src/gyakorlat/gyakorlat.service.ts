import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { CreateGyakorlatDto } from "./dto/create-gyakorlat.dto";
import { UpdateGyakorlatDto } from "./dto/update-gyakorlat.dto";
import { PrismaService } from "src/prisma.service";
import { Gyakorlat } from "./entities/gyakorlat.entity";
import {
  GetGyakorlatokQueryDto,
  GyakorlatokResponseDto,
} from "./dto/gyakorlatok.dto";
import { PaginationHelper } from "../common/helpers/pagination.helper";
import { GyakorlatListItemDto } from "./dto/gyakorlat-list-item.dto";

@Injectable()
export class GyakorlatService {
  constructor(private prisma: PrismaService) {}

  async create(createGyakorlatDto: CreateGyakorlatDto): Promise<Gyakorlat> {
    const { izomcsoportok, ...gyakorlatData } = createGyakorlatDto;

    if ("gyakorlat_id" in createGyakorlatDto) {
      throw new BadRequestException("A gyakorlat azonosítót nem lehet megadni");
    }
    if (izomcsoportok?.length) {
      const uniqueIzomcsoportok = new Set(izomcsoportok);
      if (uniqueIzomcsoportok.size !== izomcsoportok.length) {
        throw new BadRequestException(
          "Az izomcsoportok között ismétlődő értékek találhatók"
        );
      }
    }

    if (izomcsoportok?.length) {
      const existingMuscleGroups = await this.prisma.izomcsoport.findMany({
        where: {
          izomcsoport_id: {
            in: izomcsoportok,
          },
        },
        select: {
          izomcsoport_id: true,
        },
      });

      const existingIds = existingMuscleGroups.map((m) => m.izomcsoport_id);
      const invalidIds = izomcsoportok.filter(
        (id) => !existingIds.includes(id)
      );

      if (invalidIds.length > 0) {
        throw new BadRequestException(
          `Érvénytelen izomcsoport azonosító(k): ${invalidIds.join(", ")}`
        );
      }
    }

    if (gyakorlatData.fo_izomcsoport) {
      const mainMuscleExists = await this.prisma.izomcsoport.findUnique({
        where: {
          izomcsoport_id: gyakorlatData.fo_izomcsoport,
        },
      });

      if (!mainMuscleExists) {
        throw new BadRequestException(
          `Érvénytelen fő izomcsoport azonosító: ${gyakorlatData.fo_izomcsoport}`
        );
      }
    }

    const gyakorlat = await this.prisma.gyakorlat.create({
      data: {
        ...gyakorlatData,
        izomcsoportok: {
          create:
            izomcsoportok?.map((izomcsoportId) => ({
              izomcsoport: {
                connect: { izomcsoport_id: izomcsoportId },
              },
            })) || [],
        },
      },
      include: {
        izomcsoportok: {
          select: {
            izomcsoport: {
              select: {
                izomcsoport_id: true,
              },
            },
          },
        },
      },
    });

    return {
      gyakorlat_id: gyakorlat.gyakorlat_id,
      gyakorlat_neve: gyakorlat.gyakorlat_neve,
      eszkoz: gyakorlat.eszkoz,
      gyakorlat_leiras: gyakorlat.gyakorlat_leiras,
      fo_izomcsoport: gyakorlat.fo_izomcsoport,
 
      izomcsoportok: gyakorlat.izomcsoportok.map(
        (ig) => ig.izomcsoport.izomcsoport_id
      ),
    };
  }

  async findAll(
    query: GetGyakorlatokQueryDto
  ): Promise<GyakorlatokResponseDto> {
    const { skip, take, page, limit } =
      PaginationHelper.getPaginationOptions(query);

    const where: any = {};

    if (query.nev) {
      where.gyakorlat_neve = {
        contains: query.nev,
        mode: "insensitive",
      };
    }

    if (query.izomcsoportId) {
      where.fo_izomcsoport = query.izomcsoportId;
    }

    if (query.eszkoz) {
      where.eszkoz = {
        contains: query.eszkoz,
        mode: "insensitive",
      };
    }

    if (query.izomcsoportok?.length) {
      where.OR = [
        {
          fo_izomcsoport: {
            in: query.izomcsoportok,
          },
        },
        {
          izomcsoportok: {
            some: {
              izomcsoport: {
                izomcsoport_id: {
                  in: query.izomcsoportok,
                },
              },
            },
          },
        },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.gyakorlat.findMany({
        where,
        skip,
        take,
        include: {
          izomcsoportok: {
            select: {
              izomcsoport: {
                select: {
                  izomcsoport_id: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.gyakorlat.count({ where }),
    ]);

    const mappedItems: GyakorlatListItemDto[] = items.map((item) => ({
      gyakorlat_id: item.gyakorlat_id,
      gyakorlat_neve: item.gyakorlat_neve,
      eszkoz: item.eszkoz,
      fo_izomcsoport: item.fo_izomcsoport,
      izomcsoportok: item.izomcsoportok.map(
        (ig) => ig.izomcsoport.izomcsoport_id
      ),
    }));

    return {
      items: mappedItems,
      meta: PaginationHelper.createMeta(page, limit, total),
    };
  }

  async findOne(id: number) {
    try {
      const gyakorlat = await this.prisma.gyakorlat.findUnique({
        where: { gyakorlat_id: id },
        include: {
          izomcsoportok: {
            select: {
              izomcsoport: {
                select: { izomcsoport_id: true },
              },
            },
          },
        },
      });

      if (!gyakorlat) {
        throw new NotFoundException("A gyakorlat nem található");
      }

      return {
        gyakorlat_id: gyakorlat.gyakorlat_id,
        gyakorlat_neve: gyakorlat.gyakorlat_neve,
        eszkoz: gyakorlat.eszkoz,
        gyakorlat_leiras: gyakorlat.gyakorlat_leiras,
        fo_izomcsoport: gyakorlat.fo_izomcsoport,
     
        izomcsoportok: gyakorlat.izomcsoportok.map(
          (ig) => ig.izomcsoport.izomcsoport_id
        ),
      };
    } catch (error) {
      throw new NotFoundException("A gyakorlat nem található");
    }
  }

  async update(id: number, updateGyakorlatDto: UpdateGyakorlatDto) {
    try {
      const { izomcsoportok, ...gyakorlatData } = updateGyakorlatDto;

      if (izomcsoportok?.length) {
        const uniqueIzomcsoportok = new Set(izomcsoportok);
        if (uniqueIzomcsoportok.size !== izomcsoportok.length) {
          throw new BadRequestException(
            "Az izomcsoportok között ismétlődő értékek találhatók"
          );
        }
      }

      if (izomcsoportok?.length) {
        const existingMuscleGroups = await this.prisma.izomcsoport.findMany({
          where: {
            izomcsoport_id: {
              in: izomcsoportok,
            },
          },
          select: {
            izomcsoport_id: true,
          },
        });

        const existingIds = existingMuscleGroups.map((m) => m.izomcsoport_id);
        const invalidIds = izomcsoportok.filter(
          (id) => !existingIds.includes(id)
        );

        if (invalidIds.length > 0) {
          throw new BadRequestException(
            `Érvénytelen izomcsoport azonosító(k): ${invalidIds.join(", ")}`
          );
        }
      }

      if (gyakorlatData.fo_izomcsoport) {
        const mainMuscleExists = await this.prisma.izomcsoport.findUnique({
          where: {
            izomcsoport_id: gyakorlatData.fo_izomcsoport,
          },
        });

        if (!mainMuscleExists) {
          throw new BadRequestException(
            `Érvénytelen fő izomcsoport azonosító: ${gyakorlatData.fo_izomcsoport}`
          );
        }
      }

      if ("gyakorlat_id" in updateGyakorlatDto) {
        throw new BadRequestException(
          "A gyakorlat azonosítója nem módosítható"
        );
      }

      const gyakorlat = await this.prisma.gyakorlat.update({
        where: { gyakorlat_id: id },
        data: {
          gyakorlat_neve: updateGyakorlatDto.gyakorlat_neve,
          eszkoz: updateGyakorlatDto.eszkoz,
          gyakorlat_leiras: updateGyakorlatDto.gyakorlat_leiras,
          fo_izomcsoport: updateGyakorlatDto.fo_izomcsoport,
      
          izomcsoportok: updateGyakorlatDto.izomcsoportok
            ? {
                deleteMany: {},
                create: updateGyakorlatDto.izomcsoportok.map(
                  (izomcsoportId) => ({
                    izomcsoport: {
                      connect: { izomcsoport_id: izomcsoportId },
                    },
                  })
                ),
              }
            : undefined,
        },
        include: {
          izomcsoportok: {
            select: {
              izomcsoport: {
                select: {
                  izomcsoport_id: true,
                },
              },
            },
          },
        },
      });

      return {
        gyakorlat_id: gyakorlat.gyakorlat_id,
        gyakorlat_neve: gyakorlat.gyakorlat_neve,
        eszkoz: gyakorlat.eszkoz,
        gyakorlat_leiras: gyakorlat.gyakorlat_leiras,
        fo_izomcsoport: gyakorlat.fo_izomcsoport,
        izomcsoportok: gyakorlat.izomcsoportok.map(
          (ig) => ig.izomcsoport.izomcsoport_id
        ),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === "P2025") {
        throw new NotFoundException("A gyakorlat nem található");
      }

      throw error;
    }
  }

  async remove(id: number): Promise<boolean> {
    try {
      const exists = await this.prisma.gyakorlat.findUnique({
        where: { gyakorlat_id: id },
      });

      if (!exists) {
        throw new NotFoundException("A gyakorlat nem található");
      }

      await this.prisma.$transaction([
        this.prisma.gyakorlat_Izomcsoport.deleteMany({
          where: { gyakorlat_id: id },
        }),
        this.prisma.edzes_Gyakorlat_Set.deleteMany({
          where: { gyakorlat_id: id },
        }),
        this.prisma.user_Gyakorlat_History.deleteMany({
          where: { gyakorlat_id: id },
        }),
        this.prisma.edzes_Gyakorlat.deleteMany({
          where: { gyakorlat_id: id },
        }),
        this.prisma.user_Gyakorlat.deleteMany({
          where: { gyakorlat_id: id },
        }),
        this.prisma.gyakorlat.delete({
          where: { gyakorlat_id: id },
        }),
      ]);

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === "P2025") {
        throw new NotFoundException("A gyakorlat nem található");
      }
      if (error.code === "P2003") {
        throw new BadRequestException(
          "A gyakorlat nem törölhető, mert más rekordok hivatkoznak rá"
        );
      }
      throw new BadRequestException("A gyakorlat törlése sikertelen");
    }
  }
}
