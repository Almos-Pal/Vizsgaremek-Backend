
import { Test, TestingModule } from '@nestjs/testing';
import { EdzesService } from './edzes.service';
import { EdzesController } from './edzes.controller';
import { PrismaService } from '../prisma.service';

describe('EdzesService', () => {
  let edzesController: EdzesController;
  let edzesService: EdzesService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [EdzesController],
      providers: [EdzesService, PrismaService],
    }).compile();

    edzesService = moduleRef.get(EdzesService);
    edzesController = moduleRef.get(EdzesController);
  });

  it('should be defined', () => {
    expect(edzesService).toBeDefined();
  });
});
