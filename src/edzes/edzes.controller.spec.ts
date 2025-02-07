import { PrismaService } from '../prisma.service';
import { EdzesController } from './edzes.controller';
import { EdzesService } from './edzes.service';
import { Test } from '@nestjs/testing';

import { GetEdzesekQueryDto } from './dto/get-edzesek.dto';
import { UpdateEdzesDto } from './dto/update-edzes.dto';
import { CreateEdzesDto } from './dto/create-edzes.dto';

describe('EdzesController', () => {
  const updateMockData:UpdateEdzesDto = {
    edzes_neve: "string;",
    ido: 11000
  }

const edzesMockData: any = {
  items: [{
    gyakorlatok: [{
        total_sets: 5,
        gyakorlat: {
            izomcsoportok: {
                izomcsoport: {
                    izomcsoport_id: 1,
                    nev: "string;",
                },
            }  
        }, 
        szettek: [{
            suly: 1,
            ismetles: 1,
            id: 1,
        }],
        edzes_id: 1,
        gyakorlat_id: 1,
    }],
    edzes_id: 12,
    edzes_neve: "string;",
    datum: new Date("2024-03-20"),
    ido: 11
}],
  meta: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 1,
    totalPages: 1
  }
}



  const edzesdto: GetEdzesekQueryDto = {}
  const createMockData: CreateEdzesDto = {
    edzes_neve: "string;",
    datum : "2025-01-01",
    user_id:1,
    ido:2
  }

  let edzesController: EdzesController;
  let edzesService: EdzesService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [EdzesController],
      providers: [EdzesService,PrismaService],
    }).compile();

    edzesService = moduleRef.get(EdzesService);
    edzesController = moduleRef.get(EdzesController);
  });

  describe('findAll', () => {
    it('should return an array', () => {
      jest.spyOn(edzesService, 'findAll').mockResolvedValue(edzesMockData );
      expect(edzesController.findAll(edzesdto)).resolves.toEqual(edzesMockData);
    });
  });
  describe('findOne', () => {
    it('should return one element', () => {
      jest.spyOn(edzesService, 'findOne').mockResolvedValue(edzesMockData.items[0]);
      expect(edzesController.findOne(1)).resolves.toEqual(edzesMockData.items[0]);
    });
  });
  const updatedMock = {updateMockData, ...edzesMockData }
  describe('update', () => {
    it('should update one element', () => {
      jest.spyOn(edzesService, 'update').mockResolvedValue(updatedMock);
      expect(edzesController.update(1,updateMockData)).resolves.toEqual(updatedMock);
    });
  });
  describe('remove', () => {
    it('should remove one element', () => {
      jest.spyOn(edzesService, 'remove').mockResolvedValue(edzesMockData.items[0]);
      expect(edzesController.remove(1)).resolves.toEqual(edzesMockData.items[0]);
    });
  });
  describe('create', () => {
    it('should create new element', () => {
      jest.spyOn(edzesService, 'create').mockResolvedValue(edzesMockData.items[0]);
      expect(edzesController.create(createMockData)).resolves.toEqual(edzesMockData.items[0]);
    });
  });
});