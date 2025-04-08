import { Test, TestingModule } from '@nestjs/testing';
import { UserGyakorlatController } from './user-gyakorlat.controller';
import { UserGyakorlatService } from './user-gyakorlat.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { CreateUserGyakorlatDto } from './dto/create-user-gyakorlat.dto';
import { CreateUserGyakorlatHistoryDto } from './dto/create-user-gyakorlat-history.dto';
import { GetUserGyakorlatokQueryDto } from './dto/user-gyakorlatok.dto';

describe('UserGyakorlatController', () => {
  let controller: UserGyakorlatController;
  let service: UserGyakorlatService;

  const mockUserGyakorlatService = {
    createUserGyakorlat: jest.fn(),
    createUserGyakorlatHistory: jest.fn(),
    getUserGyakorlatok: jest.fn(),
    getUserGyakorlatDetails: jest.fn(),
    deleteUserGyakorlat: jest.fn(),
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

  describe('create', () => {
    it('should create a user gyakorlat', async () => {
      const createDto: CreateUserGyakorlatDto = {
        user_id: 1,
        gyakorlat_id: 1,
        personal_best: 100,
        last_weight: 90,
        last_reps: 10
      };

      const expectedResult = {
        user_id: 1,
        gyakorlat_id: 1,
        personal_best: 100,
        last_weight: 90,
        last_reps: 10,
        total_sets: 0
      };

      mockUserGyakorlatService.createUserGyakorlat.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(mockUserGyakorlatService.createUserGyakorlat).toHaveBeenCalledWith(createDto);
    });
  });

  describe('createHistory', () => {
    it('should create a history entry', async () => {
      const createDto: CreateUserGyakorlatHistoryDto = {
        user_id: 1,
        gyakorlat_id: 1,
        weight: 100,
        reps: 10,
        edzes_id: 1
      };

      const expectedResult = {
        id: 1,
        ...createDto,
        date: new Date()
      };

      mockUserGyakorlatService.createUserGyakorlatHistory.mockResolvedValue(expectedResult);

      const result = await controller.createHistory(createDto);

      expect(result).toEqual(expectedResult);
      expect(mockUserGyakorlatService.createUserGyakorlatHistory).toHaveBeenCalledWith(createDto);
    });
  });

  describe('getUserGyakorlatok', () => {
    it('should return user gyakorlatok', async () => {
      const query: GetUserGyakorlatokQueryDto = {
        page: 1,
        limit: 10
      };

      const expectedResult = {
        items: [
          {
            user_id: 1,
            gyakorlat_id: 1,
            personal_best: 100,
            last_weight: 90,
            last_reps: 10,
            total_sets: 5
          }
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1
        }
      };

      mockUserGyakorlatService.getUserGyakorlatok.mockResolvedValue(expectedResult);

      const result = await controller.getUserGyakorlatok('1', query);

      expect(result).toEqual(expectedResult);
      expect(mockUserGyakorlatService.getUserGyakorlatok).toHaveBeenCalledWith(1, query);
    });
  });

  describe('getUserGyakorlatDetails', () => {
    it('should return user gyakorlat details', async () => {
      const expectedResult = {
        user_id: 1,
        gyakorlat_id: 1,
        personal_best: 100,
        last_weight: 90,
        last_reps: 10,
        total_sets: 5,
        gyakorlat: {
          gyakorlat_id: 1,
          gyakorlat_neve: 'Test Exercise'
        },
        history: []
      };

      mockUserGyakorlatService.getUserGyakorlatDetails.mockResolvedValue(expectedResult);

      const result = await controller.getUserGyakorlatDetails('1', '1');

      expect(result).toEqual(expectedResult);
      expect(mockUserGyakorlatService.getUserGyakorlatDetails).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('deleteUserGyakorlat', () => {
    it('should delete a user gyakorlat', async () => {
      const expectedResult = {
        message: 'Gyakorlat sikeresen törölve'
      };

      mockUserGyakorlatService.deleteUserGyakorlat.mockResolvedValue(expectedResult);

      const result = await controller.deleteUserGyakorlat('1', '1');

      expect(result).toEqual(expectedResult);
      expect(mockUserGyakorlatService.deleteUserGyakorlat).toHaveBeenCalledWith(1, 1);
    });
  });
}); 