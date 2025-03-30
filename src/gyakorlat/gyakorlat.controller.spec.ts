import { Test, TestingModule } from '@nestjs/testing';
import { GyakorlatController } from './gyakorlat.controller';
import { GyakorlatService } from './gyakorlat.service';
import { CreateGyakorlatDto } from './dto/create-gyakorlat.dto';
import { UpdateGyakorlatDto } from './dto/update-gyakorlat.dto';
import { GetGyakorlatokQueryDto } from './dto/gyakorlatok.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard';
import { ExecutionContext } from '@nestjs/common';

// Mock data
const mockGyakorlatok = [
  {
    gyakorlat_id: 1,
    gyakorlat_neve: 'Fekvenyomás',
    eszkoz: 'Rúd',
    gyakorlat_leiras: 'Fekvenyomás leírása',
    fo_izomcsoport: 4,
    user_id: 1,
    izomcsoportok: [4, 2, 6]
  },
  {
    gyakorlat_id: 2,
    gyakorlat_neve: 'Guggolás',
    eszkoz: 'Rúd',
    gyakorlat_leiras: 'Guggolás leírása',
    fo_izomcsoport: 1,
    user_id: 1,
    izomcsoportok: [1, 5]
  },
  {
    gyakorlat_id: 3,
    gyakorlat_neve: 'Húzódzkodás',
    eszkoz: 'Húzódzkodó',
    gyakorlat_leiras: 'Húzódzkodás leírása',
    fo_izomcsoport: 8,
    user_id: 2,
    izomcsoportok: [8, 7]
  }
];

const mockUser = {
  user_id: 1,
  email: 'teszt@teszt',
}


const mockGyakorlatService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn()
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

describe('GyakorlatController', () => {
  let controller: GyakorlatController;
  let service: GyakorlatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GyakorlatController],
      providers: [
        {
          provide: GyakorlatService,
          useValue: mockGyakorlatService,
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

    controller = module.get<GyakorlatController>(GyakorlatController);
    service = module.get<GyakorlatService>(GyakorlatService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new gyakorlat', async () => {
      const createGyakorlatDto = {
        gyakorlat_neve: 'Test Exercise',
        eszkoz: 'Barbell',
        gyakorlat_leiras: 'Test description',
        fo_izomcsoport: 1,
        user_id: 1
      };

      mockGyakorlatService.create.mockResolvedValue(createGyakorlatDto);

      const result = await controller.create(createGyakorlatDto);
      expect(result).toEqual(createGyakorlatDto);
      expect(mockGyakorlatService.create).toHaveBeenCalledWith(createGyakorlatDto);
    });

    it('should handle validation errors during creation', async () => {
      const invalidDto = {
        gyakorlat_neve: '', 
        fo_izomcsoport: 4,
        izomcsoportok: [4]
      };

      mockGyakorlatService.create.mockRejectedValue(
        new BadRequestException('A gyakorlat neve kötelező')
      );

      await expect(controller.create(invalidDto as CreateGyakorlatDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated gyakorlatok without filters', async () => {
      const query: GetGyakorlatokQueryDto = {
        page: 1,
        limit: 10
      };

      const expectedResponse = {
        items: mockGyakorlatok,
        meta: {
          page: 1,
          limit: 10,
          total: 3,
          totalPages: 1
        }
      };

      mockGyakorlatService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResponse);
      expect(mockGyakorlatService.findAll).toHaveBeenCalledWith(query);
    });

    it('should return filtered gyakorlatok', async () => {
      const query: GetGyakorlatokQueryDto = {
        page: 1,
        limit: 10,
        nev: 'Fekvenyomás',
        izomcsoportId: 4
      };

      const filteredGyakorlatok = [mockGyakorlatok[0]];
      const expectedResponse = {
        items: filteredGyakorlatok,
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      };

      mockGyakorlatService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResponse);
      expect(mockGyakorlatService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a gyakorlat by id', async () => {
      const id = 1;
      mockGyakorlatService.findOne.mockResolvedValue(mockGyakorlatok[0]);

      const result = await controller.findOne(id);

      expect(result).toEqual(mockGyakorlatok[0]);
      expect(mockGyakorlatService.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when gyakorlat not found', async () => {
      const id = 999;
      mockGyakorlatService.findOne.mockResolvedValue(null);

      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a gyakorlat', async () => {
      const id = 1;
      const updateDto: UpdateGyakorlatDto = {
        gyakorlat_neve: 'Módosított gyakorlat',
        eszkoz: 'Új eszköz'
      };

      const expectedResult = {
        ...mockGyakorlatok[0],
        ...updateDto
      };

      mockGyakorlatService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockGyakorlatService.update).toHaveBeenCalledWith(id, updateDto);
    });

    it('should throw NotFoundException when updating non-existent gyakorlat', async () => {
      const id = 999;
      const updateDto: UpdateGyakorlatDto = {
        gyakorlat_neve: 'Módosított gyakorlat'
      };

      mockGyakorlatService.update.mockResolvedValue(null);

      await expect(controller.update(id, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a gyakorlat', async () => {
      const id = 1;
      mockGyakorlatService.remove.mockResolvedValue(true);

      const result = await controller.remove(id);

      expect(result).toEqual({
        statusCode: 200,
        message: `A(z) ${id} azonosítójú gyakorlat sikeresen törölve`
      });
      expect(mockGyakorlatService.remove).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when deleting non-existent gyakorlat', async () => {
      const id = 999;
      mockGyakorlatService.remove.mockResolvedValue(false);

      await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
});
