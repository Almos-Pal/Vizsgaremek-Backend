import { Test, TestingModule } from '@nestjs/testing';
import { UserGyakorlatController } from './user-gyakorlat.controller';
import { UserGyakorlatService } from './user-gyakorlat.service';
import { PrismaService } from 'src/prisma.service';

describe('UserGyakorlatController', () => {
  let controller: UserGyakorlatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserGyakorlatController],
      providers: [UserGyakorlatService, PrismaService],
    }).compile();

    controller = module.get<UserGyakorlatController>(UserGyakorlatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
}); 