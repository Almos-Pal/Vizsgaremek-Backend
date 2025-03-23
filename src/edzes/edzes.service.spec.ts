import { Test, TestingModule } from '@nestjs/testing';
import { EdzesService } from './edzes.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('EdzesService', () => {
  let service: EdzesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    edzes: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    gyakorlat: {
      findUnique: jest.fn(),
    },
    edzes_Gyakorlat: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    user_Gyakorlat_History: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EdzesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EdzesService>(EdzesService);
    prisma = module.get<PrismaService>(PrismaService);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createEdzesDto = {
      edzes_neve: 'Test Workout',
      user_id: 1,
      datum: new Date().toISOString(),
      ido: 60,
      isTemplate: false,
    };

    it('should create an edzes successfully', async () => {
      const mockUser = { user_id: 1, username: 'test' };
      const mockEdzes = { 
        edzes_id: 1, 
        ...createEdzesDto, 
        gyakorlatok: [] 
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.edzes.findMany.mockResolvedValue([]); // No existing workouts on that day
      mockPrismaService.edzes.create.mockResolvedValue(mockEdzes);

      const result = await service.create(createEdzesDto);

      expect(result).toBeDefined();
      expect(result.edzes_neve).toBe(createEdzesDto.edzes_neve);
      expect(mockPrismaService.edzes.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.create(createEdzesDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when workout exists on same day', async () => {
      const mockUser = { user_id: 1, username: 'test' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.edzes.findMany.mockResolvedValue([{ edzes_id: 1 }]);

      await expect(service.create(createEdzesDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return an edzes by id', async () => {
      const mockEdzes = {
        edzes_id: 1,
        edzes_neve: 'Test Workout',
        user_id: 1,
        gyakorlatok: [],
      };

      mockPrismaService.edzes.findUnique.mockResolvedValue(mockEdzes);

      const result = await service.findOne(1);

      expect(result).toBeDefined();
      expect(result.edzes_neve).toBe(mockEdzes.edzes_neve);
    });

    it('should throw NotFoundException when edzes not found', async () => {
      mockPrismaService.edzes.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addGyakorlatToEdzes', () => {
    const mockParams = {
      edzesId: 1,
      userId: 1,
      gyakorlatDto: { gyakorlat_id: 1 }
    };

    it('should add gyakorlat to edzes successfully', async () => {
      const mockEdzes = { edzes_id: 1, user_id: 1 };
      const mockGyakorlat = { gyakorlat_id: 1 };
      const mockEdzesGyakorlat = { 
        edzes_id: 1, 
        gyakorlat_id: 1,
        createdAt: new Date()
      };

      mockPrismaService.edzes.findUnique.mockResolvedValue(mockEdzes);
      mockPrismaService.gyakorlat.findUnique.mockResolvedValue(mockGyakorlat);
      mockPrismaService.edzes_Gyakorlat.findUnique.mockResolvedValue(null);
      mockPrismaService.edzes_Gyakorlat.create.mockResolvedValue(mockEdzesGyakorlat);

      const result = await service.addGyakorlatToEdzes(
        mockParams.edzesId,
        mockParams.userId,
        mockParams.gyakorlatDto
      );

      expect(result).toBeDefined();
      expect(mockPrismaService.edzes_Gyakorlat.create).toHaveBeenCalled();
    });
  });

  describe('changeEdzesFinalizedStatus', () => {
    it('should change finalized status successfully', async () => {
      const mockEdzes = {
        edzes_id: 1,
        user_id: 1,
        isFinalized: false
      };

      mockPrismaService.edzes.findUnique.mockResolvedValue(mockEdzes);
      mockPrismaService.edzes.update.mockResolvedValue({
        ...mockEdzes,
        isFinalized: true
      });

      const result = await service.changeEdzesFinalizedStatus(1, 1, true);

      expect(result).toBeDefined();
      expect(result.isFinalized).toBe(true);
      expect(mockPrismaService.edzes.update).toHaveBeenCalled();
    });
  });
});