import { Test, TestingModule } from '@nestjs/testing';
import { GyakorlatService } from './gyakorlat.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException } from '@nestjs/common';
import { GetGyakorlatokQueryDto, GyakorlatokResponseDto } from './dto/gyakorlatok.dto';

describe('GyakorlatService', () => {
  let service: GyakorlatService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    gyakorlat: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GyakorlatService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<GyakorlatService>(GyakorlatService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated gyakorlatok', async () => {
      const mockGyakorlatok = [
        {
          gyakorlat_id: 1,
          gyakorlat_neve: 'Test Gyakorlat 1',
          eszkoz: 'Test eszköz 1',
          fo_izomcsoport: 1,
          izomcsoportok: [
            {
              izomcsoport: {
                izomcsoport_id: 1,
                nev: 'Test Izomcsoport 1'
              }
            }
          ]
        },
        {
          gyakorlat_id: 2,
          gyakorlat_neve: 'Test Gyakorlat 2',
          eszkoz: 'Test eszköz 2',
          fo_izomcsoport: 2,
          izomcsoportok: [
            {
              izomcsoport: {
                izomcsoport_id: 2,
                nev: 'Test Izomcsoport 2'
              }
            }
          ]
        }
      ];
      const mockCount = 2;
      const query: GetGyakorlatokQueryDto = { page: 1, limit: 10 };

      mockPrismaService.gyakorlat.findMany.mockResolvedValue(mockGyakorlatok);
      mockPrismaService.gyakorlat.count.mockResolvedValue(mockCount);

      const result = await service.findAll(query);
      
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('meta');
      expect(result.items).toEqual(mockGyakorlatok.map(item => ({
        gyakorlat_id: item.gyakorlat_id,
        gyakorlat_neve: item.gyakorlat_neve,
        eszkoz: item.eszkoz,
        fo_izomcsoport: item.fo_izomcsoport,
        izomcsoportok: item.izomcsoportok.map(ig => ig.izomcsoport.izomcsoport_id)
      })));
      expect(result.meta).toEqual({
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: mockCount,
        totalPages: 1,
        favoriteExercises: undefined
      });
    });
  });
});
