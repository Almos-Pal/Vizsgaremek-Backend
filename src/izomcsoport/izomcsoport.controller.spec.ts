import { Test, TestingModule } from '@nestjs/testing';
import { IzomcsoportController } from './izomcsoport.controller';
import { IzomcsoportService } from './izomcsoport.service';

describe('IzomcsoportController', () => {
  let controller: IzomcsoportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IzomcsoportController],
      providers: [IzomcsoportService],
    }).compile();

    controller = module.get<IzomcsoportController>(IzomcsoportController);
  });


});
