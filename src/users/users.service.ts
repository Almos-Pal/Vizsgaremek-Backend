import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { hash } from 'bcrypt';
import getBmiCategory from 'src/common/helpers/bmi';

@Injectable()
export class UsersService {
  constructor(private readonly db: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.findByEmail(createUserDto.email)

      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }

      const newUser = await this.db.user.create({
        data: {
          ...createUserDto,
          password: await hash(createUserDto.password, 10),
        },
      });

      const { password, ...result } = newUser;
      return result;
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return this.db.user.findMany({
      select: {
        user_id: true,
        email: true,
        username: true,
        suly: true,
        magassag: true,
        isAdmin: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.db.user.findUnique({
      where: { user_id: id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    } else {
      const { password, ...result } = user;

      return result;
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    
    try {
      if (updateUserDto.password) {
        updateUserDto.password = await hash(updateUserDto.password, 10);
      }

      const user = await this.db.user.update({
        where: { user_id: id },
        data: updateUserDto,
      });
      const { password, ...result } = user;
      return result;

    } catch (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      const user = await this.db.user.findUnique({
        where: { user_id: id }
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Minden kapcsolódó adat törlése tranzakcióban
      await this.db.$transaction(async (prisma) => {
        // Az összes user gyakorlat history bejegyzés törlése
        await prisma.user_Gyakorlat_History.deleteMany({
          where: { user_id: id }
        });

        // az összes edzes gyakorlat set bejgyezés törlése
        await prisma.edzes_Gyakorlat_Set.deleteMany({
          where: {
            edzes_gyakorlat: {
              edzes: {
                user_id: id
              }
            }
          }
        });

        // Az összes edzes gyakorlat kapcsolat törlése
        await prisma.edzes_Gyakorlat.deleteMany({
          where: {
            edzes: {
              user_id: id
            }
          }
        });

        // Az összes edzés bejegyzés törlése
        await prisma.edzes.deleteMany({
          where: { user_id: id }
        });

        // Az összes  user gyakorlat kapcsolat
        await prisma.user_Gyakorlat.deleteMany({
          where: { user_id: id }
        });

        // Végül a user törlése
        await prisma.user.delete({
          where: { user_id: id }
        });
      });

      return { message: 'User and all related data successfully deleted' };

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete user: ' + error.message);
    }
  }

  async findByEmail(email: string) {
    return await this.db.user.findUnique({
      where: {
        email: email
      }
    });
  }

  async getBMI(id: number) {
    try {
      const user = await this.db.user.findUnique({
        where: { user_id: id }
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      if (user.suly === null || user.magassag === null) {
        throw new BadRequestException('User weight or height is not set');

      }




      const bmi = user.suly / ((user.magassag / 100) ** 2);


      const type = getBmiCategory(bmi);

      return {
        bmi: bmi.toFixed(2),
        type: type
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to calculate BMI: ' + error.message);
    }

  }

  async changeAdmin(id: number, adminDto: { isAdmin: boolean }) {
    try {
      const user = await this.db.user.findUnique({
        where: { user_id: id }
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      if (user.isAdmin === adminDto.isAdmin) {
        throw new BadRequestException('User is already in the requested state');
      }

      await this.db.user.update({
        where: { user_id: id },
        data: {
          isAdmin: adminDto.isAdmin
        }
      });

      return { message: 'Admin status successfully changed' };

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ForbiddenException('Failed to change admin status: ' + error.message);
    }
  }
}
