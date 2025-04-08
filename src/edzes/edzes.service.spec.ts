import { Test, TestingModule } from '@nestjs/testing';
import { EdzesService } from './edzes.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateEdzesDto } from './dto/create-edzes.dto';
import { AddEdzesGyakorlatDto } from './dto/add-edzes-gyakorlat.dto';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

describe('EdzesService', () => {
  let service: EdzesService;
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

  const mockEdzes = {
    edzes_id: 1,
    edzes_neve: 'Test Workout',
    datum: new Date(),
    isTemplate: false,
    user_id: 1,
    ido: 60,
    isFinalized: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    gyakorlatok: []
  };

  const mockGyakorlat = {
    gyakorlat_id: 1,
    gyakorlat_neve: 'Test Exercise',
    eszkoz: 'Barbell',
    gyakorlat_leiras: 'Test description',
    fo_izomcsoport: 1,
    user_id: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockEdzesGyakorlat = {
    edzes_id: 1,
    gyakorlat_id: 1,
    createdAt: new Date()
  };

  const mockPreviousHistory = {
    id: 1,
    user_id: 1,
    gyakorlat_id: 1,
    weight: 50,
    reps: 10,
    date: new Date('2025-03-23T10:51:32.054Z'),
    edzes_id: 1
  };

  beforeEach(async () => {
    mockDb = mockDeep<PrismaService>();
    mockDb.$transaction.mockImplementation((callback) => callback(mockDb));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EdzesService,
        {
          provide: PrismaService,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<EdzesService>(EdzesService);
  });

  describe('create', () => {
    it('should create an edzes successfully', async () => {
      const createEdzesDto: CreateEdzesDto = {
        edzes_neve: 'Test Workout',
        datum: new Date().toISOString(),
        isTemplate: false,
        ido: 60,
        user_id: 1
      };

      mockDb.user.findUnique.mockResolvedValue(mockUser);
      mockDb.edzes.findMany.mockResolvedValue([]);
      mockDb.edzes.create.mockResolvedValue(mockEdzes);

      const result = await service.create(createEdzesDto);

      expect(result).toBeDefined();
      expect(result.edzes_neve).toBe(createEdzesDto.edzes_neve);
      expect(mockDb.edzes.create).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should include gyakorlatok in the response', async () => {
      mockDb.edzes.findUnique.mockResolvedValue(mockEdzes);
      mockDb.user_Gyakorlat_History.findFirst.mockResolvedValue(mockPreviousHistory);
      mockDb.user_Gyakorlat_History.findMany.mockResolvedValue([mockPreviousHistory]);

      const result = await service.findOne(1);

      expect(result).toBeDefined();
      expect(result.gyakorlatok).toBeDefined();
    });
  });

  describe('addGyakorlatToEdzes', () => {
    it('should throw NotFoundException when edzes not found', async () => {
      mockDb.edzes.findUnique.mockResolvedValue(null);

      await expect(service.addGyakorlatToEdzes(
        1,
        1,
        { gyakorlat_id: 1 } as AddEdzesGyakorlatDto
      )).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when gyakorlat already exists in edzes', async () => {
      mockDb.edzes.findUnique.mockResolvedValue(mockEdzes);
      mockDb.gyakorlat.findUnique.mockResolvedValue(mockGyakorlat);
      mockDb.edzes_Gyakorlat.findUnique.mockResolvedValue(mockEdzesGyakorlat);

      await expect(service.addGyakorlatToEdzes(
        1,
        1,
        { gyakorlat_id: 1 } as AddEdzesGyakorlatDto
      )).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteGyakorlatFromEdzes', () => {
    it('should delete gyakorlat from edzes successfully', async () => {
      const mockTransactionPrisma = mockDeep<PrismaService>();
      mockDb.$transaction.mockImplementation((callback) => callback(mockTransactionPrisma));

      mockDb.edzes.findUnique.mockResolvedValue(mockEdzes);
      mockDb.edzes_Gyakorlat.findUnique.mockResolvedValue(mockEdzesGyakorlat);
      
      mockTransactionPrisma.edzes_Gyakorlat_Set.deleteMany.mockResolvedValue({ count: 1 });
      mockTransactionPrisma.edzes_Gyakorlat.delete.mockResolvedValue(mockEdzesGyakorlat);
      mockTransactionPrisma.user_Gyakorlat_History.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.deleteGyakorlatFromEdzes(1, 1, 1);

      expect(result).toBeDefined();
      expect(result.message).toBe('Gyakorlat sikeresen törölve az edzésből');
      expect(mockTransactionPrisma.edzes_Gyakorlat_Set.deleteMany).toHaveBeenCalled();
      expect(mockTransactionPrisma.edzes_Gyakorlat.delete).toHaveBeenCalled();
      expect(mockTransactionPrisma.user_Gyakorlat_History.deleteMany).toHaveBeenCalled();
    });

    it('should throw BadRequestException when edzes not found', async () => {
      mockDb.edzes.findUnique.mockResolvedValue(null);

      await expect(service.deleteGyakorlatFromEdzes(1, 1, 1))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when gyakorlat not found in edzes', async () => {
      mockDb.edzes.findUnique.mockResolvedValue(mockEdzes);
      mockDb.edzes_Gyakorlat.findUnique.mockResolvedValue(null);

      await expect(service.deleteGyakorlatFromEdzes(1, 1, 1))
        .rejects.toThrow(BadRequestException);
    });
  });
});