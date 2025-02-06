import { Test, TestingModule } from '@nestjs/testing';
import { EdzesController } from './edzes.controller';
import { EdzesService } from './edzes.service';

describe('EdzesController', () => {
  let controller: EdzesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EdzesController],
      providers: [EdzesService],
    }).compile();

    controller = module.get<EdzesController>(EdzesController);
  });


});
