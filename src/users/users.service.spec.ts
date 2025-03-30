import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let mockDb: DeepMockProxy<PrismaService>;

  const mockUser = {
    user_id: 1,
    username: 'testuser',
    email: 'test@test.com',
    password: 'hashedpassword',
    isAdmin: false,
    suly: 70,
    magassag: 175,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    mockDb = mockDeep<PrismaService>();
    mockDb.$transaction.mockImplementation((callback) => callback(mockDb));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123',
        suly: 70,
        magassag: 175,
        isAdmin: false
      };

      mockDb.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      mockDb.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.username).toBe(createUserDto.username);
      expect(mockDb.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if username exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123',
        isAdmin: false
      };

      mockDb.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      mockDb.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toBeDefined();
      expect(result.user_id).toBe(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });
});
