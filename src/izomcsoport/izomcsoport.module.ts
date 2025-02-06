import { Module } from '@nestjs/common';
import { IzomcsoportService } from './izomcsoport.service';
import { IzomcsoportController } from './izomcsoport.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [IzomcsoportController],
  providers: [IzomcsoportService,PrismaService],
})
export class IzomcsoportModule {}
