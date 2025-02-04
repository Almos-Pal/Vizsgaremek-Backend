import { Module } from '@nestjs/common';
import { UserGyakorlatService } from './user-gyakorlat.service';
import { UserGyakorlatController } from './user-gyakorlat.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [UserGyakorlatController],
  providers: [UserGyakorlatService, PrismaService],
  exports: [UserGyakorlatService]
})
export class UserGyakorlatModule {} 