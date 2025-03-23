import { Module } from '@nestjs/common';
import { GyakorlatService } from './gyakorlat.service';
import { GyakorlatController } from './gyakorlat.controller';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [GyakorlatController],
  providers: [GyakorlatService,PrismaService, JwtService],
})
export class GyakorlatModule {}
