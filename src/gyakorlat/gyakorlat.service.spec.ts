import { Test, TestingModule } from '@nestjs/testing';
import { GyakorlatService } from './gyakorlat.service';

describe('GyakorlatService', () => {
  let service: GyakorlatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GyakorlatService],
    }).compile();

    service = module.get<GyakorlatService>(GyakorlatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
