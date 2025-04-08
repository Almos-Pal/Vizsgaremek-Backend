import { Test, TestingModule } from '@nestjs/testing';
import { IzomcsoportService } from './izomcsoport.service';
import { PrismaService } from '../prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

describe('IzomcsoportService', () => {
  let service: IzomcsoportService;
  let mockDb: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    mockDb = mockDeep<PrismaService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IzomcsoportService,
        {
          provide: PrismaService,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<IzomcsoportService>(IzomcsoportService);
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
      mockDb.izomcsoport.findMany.mockResolvedValue(mockIzomcsoportok);

      const result = await service.findAll();
      expect(result).toEqual(mockIzomcsoportok);
      expect(mockDb.izomcsoport.findMany).toHaveBeenCalled();
    });
  });
});
