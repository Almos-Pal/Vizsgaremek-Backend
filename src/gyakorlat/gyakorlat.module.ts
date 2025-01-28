import { Module } from '@nestjs/common';
import { GyakorlatService } from './gyakorlat.service';
import { GyakorlatController } from './gyakorlat.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [GyakorlatController],
  providers: [GyakorlatService,PrismaService],
})
export class GyakorlatModule {}
