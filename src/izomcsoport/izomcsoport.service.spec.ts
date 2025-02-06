import { Test, TestingModule } from '@nestjs/testing';
import { IzomcsoportService } from './izomcsoport.service';

describe('IzomcsoportService', () => {
  let service: IzomcsoportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IzomcsoportService],
    }).compile();

    service = module.get<IzomcsoportService>(IzomcsoportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
