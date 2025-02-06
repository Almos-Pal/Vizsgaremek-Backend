import { Get, Injectable } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'src/prisma.service';
import { Izomcsoport } from './entities/izomcsoport.entity';
import { ErrorResponseDto } from 'src/common/dto';
@ApiTags('Izomcsoportok')
@Injectable()
export class IzomcsoportService {

  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.izomcsoport.findMany();
  }
}
