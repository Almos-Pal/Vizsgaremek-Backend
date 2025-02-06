import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service'; 
import { User } from '@prisma/client';

describe('UsersService', () => {
  let userService: UsersService;
  let prismaService: PrismaService; 


  const userMockData: User[] = [
    { user_id: 1, username: 'string', password: 'string', email: 'string' },
  ];

  const userMockSingleData: User = {
    user_id: 1,
    username: 'string',
    password: 'string',
    email: 'string',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn().mockResolvedValue(userMockData),
              findUnique: jest.fn().mockResolvedValue(userMockSingleData), 
            },
          },
        },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      await expect(userService.findAll()).resolves.toEqual(userMockData);
      expect(prismaService.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return one user', async () => {
      await expect(userService.findOne(1)).resolves.toEqual(userMockSingleData);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { user_id: 1 },
      });
    });
  });
});