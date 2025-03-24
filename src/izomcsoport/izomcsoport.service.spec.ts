import { Test, TestingModule } from '@nestjs/testing';
import { IzomcsoportService } from './izomcsoport.service';
import { PrismaService } from '../prisma.service';

describe('IzomcsoportService', () => {
  let service: IzomcsoportService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    izomcsoport: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IzomcsoportService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<IzomcsoportService>(IzomcsoportService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of izomcsoportok', async () => {
      const mockIzomcsoportok = [
        { izomcsoport_id: 1, nev: 'Test Izomcsoport 1' },
        { izomcsoport_id: 2, nev: 'Test Izomcsoport 2' },
      ];
      mockPrismaService.izomcsoport.findMany.mockResolvedValue(mockIzomcsoportok);

      const result = await service.findAll();
      expect(result).toEqual(mockIzomcsoportok);
      expect(mockPrismaService.izomcsoport.findMany).toHaveBeenCalled();
    });
  });
});
