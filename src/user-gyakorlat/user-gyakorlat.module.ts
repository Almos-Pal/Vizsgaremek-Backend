import { Module } from '@nestjs/common';
import { UserGyakorlatService } from './user-gyakorlat.service';
import { UserGyakorlatController } from './user-gyakorlat.controller';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [UserGyakorlatController],
  providers: [UserGyakorlatService, PrismaService, JwtService],
  exports: [UserGyakorlatService]
})
export class UserGyakorlatModule {} 