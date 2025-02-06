import { Test, TestingModule } from '@nestjs/testing';
import { EdzesService } from './edzes.service';
import { PrismaService } from '../prisma.service';
import { GetEdzesekQueryDto } from './dto/get-edzesek.dto';
import { CreateEdzesDto } from './dto/create-edzes.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mock data
const mockEdzesek = [
  {
    edzes_id: 1,
    edzes_neve: 'Hétfői edzés',
    datum: new Date('2024-03-20'),
    user_id: 1,
    ido: 60,
    gyakorlatok: [
      {
        gyakorlat: {
          gyakorlat_id: 1,
          gyakorlat_neve: 'Fekvenyomás',
          izomcsoportok: [
            {
              izomcsoport: {
                izomcsoport_id: 4
              }
            }
          ]
        },
        szettek: [
          {
            id: 1,
            set_szam: 1,
            weight: 60,
            reps: 12
          }
        ]
      }
    ]
  },
  {
    edzes_id: 2,
    edzes_neve: 'Keddi edzés',
    datum: new Date('2024-03-21'),
    user_id: 1,
    ido: 45,
    gyakorlatok: []
  },
  {
    edzes_id: 3,
    edzes_neve: 'Szerdai edzés',
    datum: new Date('2024-03-22'),
    user_id: 2,
    ido: 90,
    gyakorlatok: []
  }
];

const mockUser = [
  {
    user_id: 1,
    email: 'test@gmail.com'
  },
]

// Mock Prisma service
const mockPrismaService = {
  edzes: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  user: {
    findUnique: jest.fn()
  },
  $transaction: jest.fn()
};


describe('EdzesService', () => {
  let service: EdzesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EdzesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ],
    }).compile();

    service = module.get<EdzesService>(EdzesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated edzések without user_id filter', async () => {
      const query: GetEdzesekQueryDto = {
        page: 1,
        limit: 10
      };

      mockPrismaService.edzes.findMany.mockResolvedValue(mockEdzesek);
      mockPrismaService.edzes.count.mockResolvedValue(3);

      const result = await service.findAll(query);

      expect(result.items).toHaveLength(3);
      expect(result.meta.totalPages).toBe(1);
      expect(mockPrismaService.edzes.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10
        })
      );
    });

    it('should return filtered edzések by user_id', async () => {
      const query: GetEdzesekQueryDto = {
        page: 1,
        limit: 10,
        user_id: 1
      };

      const filteredEdzesek = mockEdzesek.filter(e => e.user_id === 1);
      mockPrismaService.edzes.findMany.mockResolvedValue(filteredEdzesek);
      mockPrismaService.edzes.count.mockResolvedValue(2);

      const result = await service.findAll(query);

      expect(result.items).toHaveLength(2);
      expect(result.meta.totalPages).toBe(1);
      expect(mockPrismaService.edzes.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 1 }
        })
      );
    });

    it('should handle pagination correctly', async () => {
      const query: GetEdzesekQueryDto = {
        page: 2,
        limit: 1
      };

      mockPrismaService.edzes.findMany.mockResolvedValue([mockEdzesek[1]]);
      mockPrismaService.edzes.count.mockResolvedValue(3);

      const result = await service.findAll(query);

      expect(result.items).toHaveLength(1);
      expect(result.meta.totalPages).toBe(3);
      expect(mockPrismaService.edzes.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 1,
          take: 1
        })
      );
    });
  });

  describe('create', () => {
    it('should create a new edzés', async () => {
      const createDto: CreateEdzesDto = {
        edzes_neve: 'Test edzés',
        user_id: 1,
        ido: 60
      };

      const expectedEdzes = {
        edzes_id: 4,
        ...createDto,
        datum: expect.any(Date),
        gyakorlatok: []
      };

      mockPrismaService.edzes.create.mockResolvedValue(expectedEdzes);

      const result = await service.create(createDto);

      expect(result).toEqual(expect.objectContaining({
        edzes_neve: createDto.edzes_neve,
        ido: createDto.ido
      }));
      expect(mockPrismaService.edzes.create).toHaveBeenCalled();
    });

    it('should create an edzés with a specific date', async () => {
      const createDto: CreateEdzesDto = {
        edzes_neve: 'Test edzés',
        datum: '2024-03-20',
        user_id: 1,
        ido: 60
      };

      const expectedEdzes = {
        edzes_id: 4,
        ...createDto,
        datum: new Date('2024-03-20'),
        gyakorlatok: []
      };

      mockPrismaService.edzes.create.mockResolvedValue(expectedEdzes);

      const result = await service.create(createDto);

      expect(result.datum).toEqual(expectedEdzes.datum);
      expect(mockPrismaService.edzes.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            datum: expectedEdzes.datum
          })
        })
      );
    });
  });

  describe('findOne', () => {
    it('should return an edzés by id', async () => {
      const id = 1;
      mockPrismaService.edzes.findUnique.mockResolvedValue(mockEdzesek[0]);

      const result = await service.findOne(id);

      expect(result).toBeDefined();
      expect(result.edzes_id).toBe(id);
      expect(mockPrismaService.edzes.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { edzes_id: id }
        })
      );
    });

    it('should throw NotFoundException when edzés not found', async () => {
      const id = 999;
      mockPrismaService.edzes.findUnique.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete an edzés', async () => {
      const id = 1;
      mockPrismaService.edzes.findUnique.mockResolvedValue(mockEdzesek[0]);
      mockPrismaService.$transaction.mockResolvedValue([]);

      const result = await service.remove(id);

      expect(result).toEqual({ message: 'Az edzés sikeresen törölve.' });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when trying to delete non-existent edzés', async () => {
      const id = 999;
      mockPrismaService.edzes.findUnique.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
});
