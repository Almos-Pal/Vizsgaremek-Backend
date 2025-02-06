import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('UsersController', () => {


  let edzesController: UsersController;
  let userService: UsersService;

  let userMockData: User[] = [];
  userMockData.push({user_id: 1, username: "string", password: "string", email: "string",});
  const removemessage = { message: 'User and all related data successfully deleted' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService, PrismaService, JwtService],
    }).compile();

    edzesController = module.get<UsersController>(UsersController);
    userService = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('should return an array', () => {
      jest.spyOn(userService, 'findAll').mockResolvedValue(userMockData);
      expect(edzesController.findAll()).resolves.toEqual(userMockData);
    });
  })

  describe('findOne', () => {
    it('should return one element', () => {
      jest.spyOn(userService, 'findOne').mockResolvedValue(userMockData[0]);
      expect(edzesController.findOne("21")).resolves.toEqual(userMockData[0]);
    });
  });

  describe('remove', () => {
    it('should return one element', () => {
      jest.spyOn(userService, 'remove').mockResolvedValue(removemessage);
      expect(edzesController.remove("1")).resolves.toEqual(removemessage);
    })
  })

  describe('update', () => {
    it('should return one element', () => {
      jest.spyOn(userService, 'update').mockResolvedValue(userMockData[0]);
      expect(edzesController.update("1", userMockData[0])).resolves.toEqual(userMockData[0]);
    })
  })



});
