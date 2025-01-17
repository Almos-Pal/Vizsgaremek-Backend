import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly db: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.db.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new Error('Email already in use');
    }

    return this.db.user.create({
      data: {
        ...createUserDto,
      }
    });
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
      const user = await this.db.user.update({ where: { user_id: id }, data: updateUserDto });
      return user;
    } catch (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      const user = await this.db.user.delete({
        where: { user_id: id },
      });
      return user;
    } catch (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
