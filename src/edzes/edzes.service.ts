import { Injectable } from '@nestjs/common';
import { CreateEdzesDto } from './dto/create-edzes.dto';
import { UpdateEdzesDto } from './dto/update-edzes.dto';
import { PrismaService } from '../prisma.service';
import { connect } from 'http2';

@Injectable()
export class EdzesService {
  constructor(private readonly db: PrismaService) {}

  create(createEdzesDto: CreateEdzesDto) {

    return this.db.edzes.create({
      data:{
            edzes_neve:createEdzesDto.edzes_neve,
            datum:new Date(createEdzesDto.datum),
            user:{connect:{user_id:createEdzesDto.user_id}},
            ido:createEdzesDto.ido
          
          }
    });
  }

  findAll() {
    return this.db.edzes.findMany();
  }

 async findOne(id: number) {
  try{

    return await this.db.edzes.findUniqueOrThrow({where: {
      edzes_id: id,
    },});
  }catch(e){
    return `Edzés with ID ${id} not found`;
  }
  }

 async update(id: number, updateEdzesDto: UpdateEdzesDto) {
  try{

    return await this.db.edzes.update({where:{
      edzes_id:id
    },data:updateEdzesDto});
  }catch(e){
  return `Edzés with ID ${id} not found`;
}}

 async remove(id: number) {
  try{

    return await this.db.edzes.delete({where:{edzes_id:id}}); 
  }catch(e){
    return `Edzés with ID ${id} not found`;
}}
}
