import { Test, TestingModule } from '@nestjs/testing';
import { IzomcsoportController } from './izomcsoport.controller';
import { IzomcsoportService } from './izomcsoport.service';
import { PrismaService } from '../prisma.service';

describe('IzomcsoportController', () => {
  let controller: IzomcsoportController;
  let service: IzomcsoportService;

  const mockIzomcsoportService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IzomcsoportController],
      providers: [
        {
          provide: IzomcsoportService,
          useValue: mockIzomcsoportService,
        },
        {
          provide: PrismaService,
          useValue: {
            $connect: jest.fn(),
            $disconnect: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<IzomcsoportController>(IzomcsoportController);
    service = module.get<IzomcsoportService>(IzomcsoportService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of izomcsoportok', async () => {
      const mockIzomcsoportok = [
        { izomcsoport_id: 1, nev: 'Test Izomcsoport 1' },
        { izomcsoport_id: 2, nev: 'Test Izomcsoport 2' },
      ];
      mockIzomcsoportService.findAll.mockResolvedValue(mockIzomcsoportok);

      const result = await controller.findAll();
      expect(result).toEqual(mockIzomcsoportok);
      expect(mockIzomcsoportService.findAll).toHaveBeenCalled();
    });
  });
});
