import { Module } from '@nestjs/common';
import { EdzesService } from './edzes.service';
import { EdzesController } from './edzes.controller';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EdzesOwnerGuard } from 'src/auth/guards/edzesOwner.guard';
import { CreateEdzesOwnerGuard } from 'src/auth/guards/createEdzes.guard';

@Module({
  controllers: [EdzesController],
  providers: [
    EdzesService,
    PrismaService,
    JwtService,
    EdzesOwnerGuard,
    CreateEdzesOwnerGuard
  ],
})
export class EdzesModule {}
