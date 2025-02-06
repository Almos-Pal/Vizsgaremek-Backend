import { Test, TestingModule } from '@nestjs/testing';
import { EdzesService } from './edzes.service';

describe('EdzesService', () => {
  let service: EdzesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EdzesService],
    }).compile();

    service = module.get<EdzesService>(EdzesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});