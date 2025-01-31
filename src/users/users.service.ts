import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly db: PrismaService) {}

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
    return this.db.user.findMany();
  }

  async findOne(id: number) {
    const user = await this.db.user.findUnique({
      where: { user_id: id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    } else {
      return user;
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.db.user.update({ 
        where: { user_id: id }, 
        data: updateUserDto 
      });
      return user;
    } catch (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      // Check if user exists
      const user = await this.db.user.findUnique({
        where: { user_id: id }
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Delete all related data in a transaction
      await this.db.$transaction(async (prisma) => {
        // 1. Delete all user gyakorlat history entries
        await prisma.user_Gyakorlat_History.deleteMany({
          where: { user_id: id }
        });

        // 2. Delete all edzes gyakorlat sets
        await prisma.edzes_Gyakorlat_Set.deleteMany({
          where: {
            edzes_gyakorlat: {
              edzes: {
                user_id: id
              }
            }
          }
        });

        // 3. Delete all edzes gyakorlat connections
        await prisma.edzes_Gyakorlat.deleteMany({
          where: {
            edzes: {
              user_id: id
            }
          }
        });

        // 4. Delete all edzés entries
        await prisma.edzes.deleteMany({
          where: { user_id: id }
        });

        // 5. Delete all user gyakorlat connections
        await prisma.user_Gyakorlat.deleteMany({
          where: { user_id: id }
        });

        // 6. Finally delete the user
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
}
