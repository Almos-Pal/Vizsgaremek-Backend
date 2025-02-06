import { Test, TestingModule } from '@nestjs/testing';
import { UserGyakorlatController } from './user-gyakorlat.controller';
import { UserGyakorlatService } from './user-gyakorlat.service';

describe('UserGyakorlatController', () => {
  let controller: UserGyakorlatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserGyakorlatController],
      providers: [UserGyakorlatService],
    }).compile();

    controller = module.get<UserGyakorlatController>(UserGyakorlatController);
  });

  
}); 