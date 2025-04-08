import { Test, TestingModule } from '@nestjs/testing';
import { EdzesController } from './edzes.controller';
import { EdzesService } from './edzes.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('EdzesController', () => {
  let controller: EdzesController;
  let service: EdzesService;

  const mockEdzesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addGyakorlatToEdzes: jest.fn(),
    removeGyakorlatFromEdzes: jest.fn(),
    changeEdzesFinalizedStatus: jest.fn(),
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
      controllers: [EdzesController],
      providers: [
        {
          provide: EdzesService,
          useValue: mockEdzesService,
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

    controller = module.get<EdzesController>(EdzesController);
    service = module.get<EdzesService>(EdzesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new edzes', async () => {
      const createEdzesDto = {
        edzes_neve: 'Test Workout',
        user_id: 1,
        datum: new Date().toISOString(),
        ido: 60,
        isTemplate: false,
      };

      const expectedResult = {
        edzes_id: 1,
        ...createEdzesDto,
      };

      mockEdzesService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createEdzesDto);
      expect(result).toEqual(expectedResult);
      expect(mockEdzesService.create).toHaveBeenCalledWith(createEdzesDto);
    });
  });
});
