import { Module } from '@nestjs/common';
import { IzomcsoportService } from './izomcsoport.service';
import { IzomcsoportController } from './izomcsoport.controller';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [IzomcsoportController],
  providers: [IzomcsoportService,PrismaService, JwtService],
})
export class IzomcsoportModule {}
