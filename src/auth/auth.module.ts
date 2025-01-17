import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma.service';


@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersService, PrismaService],
})
export class AuthModule {}
