import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('UsersController', () => {
  let controller: UsersController;
  let userMockData: User[] = [];
  userMockData.push({user_id: 1, username: "string", password: "string", email: "string",});

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService, PrismaService, JwtService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  
});

/*
let edzesController: EdzesController;
  let edzesService: EdzesService;
  let edzesMockData: Edzes[]= [];
  edzesMockData.push({edzes_id: 1, edzes_neve: "string", datum: new Date("2024-11-12"), user_id: 1, ido: 12});

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
      jest.spyOn(edzesService, 'findAll').mockResolvedValue( edzesMockData);
      expect(edzesController.findAll()).resolves.toEqual(edzesMockData);
    });
  });
  describe('findOne', () => {
    it('should return one element', () => {
      jest.spyOn(edzesService, 'findOne').mockResolvedValue(edzesMockData[0]);
      expect(edzesController.findOne(1)).resolves.toEqual(edzesMockData[0]);
    });
  });
  */
