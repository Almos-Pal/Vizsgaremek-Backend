import { Test, TestingModule } from '@nestjs/testing';
import { GyakorlatController } from './gyakorlat.controller';
import { GyakorlatService } from './gyakorlat.service';

describe('GyakorlatController', () => {
  let controller: GyakorlatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GyakorlatController],
      providers: [GyakorlatService],
    }).compile();

    controller = module.get<GyakorlatController>(GyakorlatController);
  });

  
});
