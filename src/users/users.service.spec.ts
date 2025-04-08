import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserQueryDto } from './dto/user.dto';

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

  const mockAdminUser = {
    ...mockUser,
    isAdmin: true,
    user_id: 2
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

  describe('findAll', () => {
    it('should return all users for admin', async () => {
      const mockUsers = [mockUser, mockAdminUser];
      const query: GetUserQueryDto = { page: 1, limit: 10, isAdmin: 'true' };
      
      mockDb.user.findMany.mockResolvedValue(mockUsers);
      mockDb.user.count.mockResolvedValue(2);

      const result = await service.findAll(query);

      expect(result).toBeDefined();
      expect(result.items).toHaveLength(2);
      expect(result.meta.totalItems).toBe(2);
      expect(mockDb.user.findMany).toHaveBeenCalled();
    });

    it('should return filtered users for non-admin', async () => {
      const query: GetUserQueryDto = { page: 1, limit: 10, isAdmin: 'false' };
      
      mockDb.user.findMany.mockResolvedValue([mockUser]);
      mockDb.user.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result).toBeDefined();
      expect(result.items).toHaveLength(1);
      expect(result.items[0].isAdmin).toBe(false);
      expect(mockDb.user.findMany).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update user data', async () => {
      const updateData = {
        suly: 75,
        magassag: 180
      };

      mockDb.user.findUnique.mockResolvedValue(mockUser);
      mockDb.user.update.mockResolvedValue({ ...mockUser, ...updateData });

      const result = await service.update(1, updateData);

      expect(result).toBeDefined();
      expect(result.suly).toBe(updateData.suly);
      expect(result.magassag).toBe(updateData.magassag);
    });

    it('should throw NotFoundException when updating non-existent user', async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { suly: 75 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockDb.user.findUnique.mockResolvedValue(mockUser);
      mockDb.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove(1);

      expect(result).toBeDefined();
      expect(mockDb.user.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when deleting non-existent user', async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
