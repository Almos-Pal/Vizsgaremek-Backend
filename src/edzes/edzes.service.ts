import { Injectable } from '@nestjs/common';
import { CreateEdzesDto } from './dto/create-edzes.dto';
import { UpdateEdzesDto } from './dto/update-edzes.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class EdzesService {
  constructor(private readonly db: PrismaService) {}

  create(createEdzesDto: CreateEdzesDto) {
    return this.db.edzes.create({
      data:createEdzesDto
    });
  }

  findAll() {
    return this.db.edzes.findMany();
  }

  findOne(id: number) {
    return this.db.edzes.findUniqueOrThrow({where: {
      edzes_id: id,
    },});
  }

  update(id: number, updateEdzesDto: UpdateEdzesDto) {
    return this.db.edzes.update({where:{
      edzes_id:id
    },data:updateEdzesDto});
    }

  remove(id: number) {
    return this.db.edzes.delete({where:{edzes_id:id}}); 
  }
}
