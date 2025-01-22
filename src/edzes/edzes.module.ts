import { Module } from '@nestjs/common';
import { EdzesService } from './edzes.service';
import { EdzesController } from './edzes.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [EdzesController],
  providers: [EdzesService,PrismaService],
})
export class EdzesModule {}
