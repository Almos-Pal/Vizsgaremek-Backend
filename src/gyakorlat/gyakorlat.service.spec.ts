
import { Test, TestingModule } from '@nestjs/testing';
import { GyakorlatService } from './gyakorlat.service';
import { GyakorlatController } from './gyakorlat.controller';
import { PrismaService } from '../prisma.service';

describe('GyakorlatService', () => {
  let gyakorlatController: GyakorlatController;
  let gyakorlatService: GyakorlatService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GyakorlatController],
      providers: [GyakorlatService, PrismaService],
    }).compile();

    gyakorlatController = moduleRef.get(GyakorlatController);
    gyakorlatService = moduleRef.get(GyakorlatService);
  });

  it('should be defined', () => {
    expect(gyakorlatService).toBeDefined();
  });
});
