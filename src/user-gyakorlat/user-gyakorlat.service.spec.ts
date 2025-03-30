import { Test, TestingModule } from '@nestjs/testing';
import { UserGyakorlatService } from './user-gyakorlat.service';
import { PrismaService } from '../prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateUserGyakorlatDto } from './dto/create-user-gyakorlat.dto';
import { CreateUserGyakorlatHistoryDto } from './dto/create-user-gyakorlat-history.dto';
import { GetUserGyakorlatokQueryDto } from './dto/user-gyakorlatok.dto';

describe('UserGyakorlatService', () => {
  let service: UserGyakorlatService;
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

  const mockGyakorlat = {
    gyakorlat_id: 1,
    gyakorlat_neve: 'Test Exercise',
    eszkoz: 'Test Equipment',
    gyakorlat_leiras: 'Test Description',
    fo_izomcsoport: 1,
    user_id: 1
  };

  const mockUserGyakorlat = {
    user_id: 1,
    gyakorlat_id: 1,
    personal_best: 100,
    last_weight: 90,
    last_reps: 10,
    total_sets: 5,
    gyakorlat: mockGyakorlat,
    history: []
  };

  beforeEach(async () => {
    mockDb = mockDeep<PrismaService>();
    mockDb.$transaction.mockImplementation((callback) => callback(mockDb));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserGyakorlatService,
        {
          provide: PrismaService,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<UserGyakorlatService>(UserGyakorlatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUserGyakorlat', () => {
    it('should create a user gyakorlat successfully', async () => {
      const createDto: CreateUserGyakorlatDto = {
        user_id: 1,
        gyakorlat_id: 1,
        personal_best: 100,
        last_weight: 90,
        last_reps: 10
      };

      mockDb.user_Gyakorlat.findUnique.mockResolvedValue(null);
      mockDb.gyakorlat.findUnique.mockResolvedValue(mockGyakorlat);
      mockDb.user.findUnique.mockResolvedValue(mockUser);
      mockDb.user_Gyakorlat.create.mockResolvedValue(mockUserGyakorlat);

      const result = await service.createUserGyakorlat(createDto);

      expect(result).toBeDefined();
      expect(result.user_id).toBe(createDto.user_id);
      expect(result.gyakorlat_id).toBe(createDto.gyakorlat_id);
      expect(mockDb.user_Gyakorlat.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user gyakorlat already exists', async () => {
      const createDto: CreateUserGyakorlatDto = {
        user_id: 1,
        gyakorlat_id: 1
      };

      mockDb.user_Gyakorlat.findUnique.mockResolvedValue(mockUserGyakorlat);

      await expect(service.createUserGyakorlat(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user or gyakorlat not found', async () => {
      const createDto: CreateUserGyakorlatDto = {
        user_id: 1,
        gyakorlat_id: 1
      };

      mockDb.user_Gyakorlat.findUnique.mockResolvedValue(null);
      mockDb.gyakorlat.findUnique.mockResolvedValue(null);
      mockDb.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.createUserGyakorlat(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createUserGyakorlatHistory', () => {
    it('should create a history entry successfully', async () => {
      const createDto: CreateUserGyakorlatHistoryDto = {
        user_id: 1,
        gyakorlat_id: 1,
        weight: 100,
        reps: 10,
        edzes_id: 1
      };

      mockDb.user_Gyakorlat.findUnique.mockResolvedValue(mockUserGyakorlat);
      mockDb.edzes.findUnique.mockResolvedValue({
        edzes_id: 1,
        edzes_neve: 'Test Workout',
        datum: new Date(),
        isTemplate: false,
        user_id: 1,
        ido: 60,
        isFinalized: false,
        isFavorite: false
      });
      mockDb.user_Gyakorlat_History.create.mockResolvedValue({
        id: 1,
        ...createDto,
        date: new Date()
      });

      const result = await service.createUserGyakorlatHistory(createDto);

      expect(result).toBeDefined();
      expect(result.weight).toBe(createDto.weight);
      expect(result.reps).toBe(createDto.reps);
      expect(mockDb.user_Gyakorlat_History.create).toHaveBeenCalled();
    });

    it('should create user gyakorlat if it does not exist', async () => {
      const createDto: CreateUserGyakorlatHistoryDto = {
        user_id: 1,
        gyakorlat_id: 1,
        weight: 100,
        reps: 10,
        edzes_id: 1
      };

      mockDb.user_Gyakorlat.findUnique.mockResolvedValue(null);
      mockDb.edzes.findUnique.mockResolvedValue({
        edzes_id: 1,
        edzes_neve: 'Test Workout',
        datum: new Date(),
        isTemplate: false,
        user_id: 1,
        ido: 60,
        isFinalized: false,
        isFavorite: false
      });
      mockDb.user.findUnique.mockResolvedValue(mockUser);
      mockDb.gyakorlat.findUnique.mockResolvedValue(mockGyakorlat);
      mockDb.user_Gyakorlat.create.mockResolvedValue(mockUserGyakorlat);
      mockDb.user_Gyakorlat_History.create.mockResolvedValue({
        id: 1,
        ...createDto,
        date: new Date()
      });

      const result = await service.createUserGyakorlatHistory(createDto);

      expect(result).toBeDefined();
      expect(mockDb.user_Gyakorlat.create).toHaveBeenCalled();
      expect(mockDb.user_Gyakorlat_History.create).toHaveBeenCalled();
    });
  });

  describe('getUserGyakorlatok', () => {
    it('should return user gyakorlatok with pagination', async () => {
      const query: GetUserGyakorlatokQueryDto = {
        page: 1,
        limit: 10
      };

      mockDb.user_Gyakorlat.findMany.mockResolvedValue([mockUserGyakorlat]);
      mockDb.user_Gyakorlat.count.mockResolvedValue(1);

      const result = await service.getUserGyakorlatok(1, query);

      expect(result).toBeDefined();
      expect(result.items).toHaveLength(1);
      expect(result.meta).toBeDefined();
    });

    it('should return user gyakorlatok with search filter', async () => {
      const query: GetUserGyakorlatokQueryDto = {
        page: 1,
        limit: 10,
        search: 'Test'
      };

      mockDb.user_Gyakorlat.findMany.mockResolvedValue([mockUserGyakorlat]);
      mockDb.user_Gyakorlat.count.mockResolvedValue(1);

      const result = await service.getUserGyakorlatok(1, query);

      expect(result).toBeDefined();
      expect(result.items).toHaveLength(1);
      expect(result.items[0].gyakorlat.gyakorlat_neve).toContain('Test');
    });
  });

  describe('getUserGyakorlatDetails', () => {
    it('should return user gyakorlat details', async () => {
      mockDb.user_Gyakorlat.findUnique.mockResolvedValue(mockUserGyakorlat);

      const result = await service.getUserGyakorlatDetails(1, 1);

      expect(result).toBeDefined();
      expect(result.user_id).toBe(1);
      expect(result.gyakorlat_id).toBe(1);
    });

    it('should throw NotFoundException if user gyakorlat not found', async () => {
      mockDb.user_Gyakorlat.findUnique.mockResolvedValue(null);

      await expect(service.getUserGyakorlatDetails(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUserGyakorlat', () => {
    it('should delete user gyakorlat and related records', async () => {
      mockDb.user_Gyakorlat.findUnique.mockResolvedValue(mockUserGyakorlat);
      mockDb.user_Gyakorlat_History.deleteMany.mockResolvedValue({ count: 1 });
      mockDb.user_Gyakorlat.delete.mockResolvedValue(mockUserGyakorlat);

      const result = await service.deleteUserGyakorlat(1, 1);

      expect(result).toBeDefined();
      expect(mockDb.user_Gyakorlat_History.deleteMany).toHaveBeenCalled();
      expect(mockDb.user_Gyakorlat.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user gyakorlat not found', async () => {
      mockDb.user_Gyakorlat.findUnique.mockResolvedValue(null);

      await expect(service.deleteUserGyakorlat(1, 1)).rejects.toThrow(NotFoundException);
    });
  });
}); 