import { Module } from '@nestjs/common';
import { EdzesService } from './edzes.service';
import { EdzesController } from './edzes.controller';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [EdzesController],
  providers: [EdzesService,PrismaService, JwtService],
})
export class EdzesModule {}
