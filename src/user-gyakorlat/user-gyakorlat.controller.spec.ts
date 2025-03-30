import { Test, TestingModule } from '@nestjs/testing';
import { UserGyakorlatController } from './user-gyakorlat.controller';
import { UserGyakorlatService } from './user-gyakorlat.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('UserGyakorlatController', () => {
  let controller: UserGyakorlatController;
  let service: UserGyakorlatService;

  const mockUserGyakorlatService = {
    findAll: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { user_id: 1, username: 'testuser' };
      return true;
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserGyakorlatController],
      providers: [
        {
          provide: UserGyakorlatService,
          useValue: mockUserGyakorlatService,
        },
        {
          provide: PrismaService,
          useValue: {
            $connect: jest.fn(),
            $disconnect: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: AuthGuard,
          useValue: mockAuthGuard,
        },
      ],
    }).compile();

    controller = module.get<UserGyakorlatController>(UserGyakorlatController);
    service = module.get<UserGyakorlatService>(UserGyakorlatService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
}); 