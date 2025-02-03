import { Test, TestingModule } from '@nestjs/testing';
import { UserGyakorlatService } from './user-gyakorlat.service';
import { PrismaService } from '../prisma.service';

describe('UserGyakorlatService', () => {
  let service: UserGyakorlatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserGyakorlatService,
        {
          provide: PrismaService,
          useValue: {}
        }
      ],
    }).compile();

    service = module.get<UserGyakorlatService>(UserGyakorlatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
}); 