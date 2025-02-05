import { PrismaService } from '../prisma.service';
import { EdzesController } from './edzes.controller';
import { EdzesService } from './edzes.service';
import { Test } from '@nestjs/testing';

describe('EdzesController', () => {
  let edzesController: EdzesController;
  let edzesService: EdzesService;
  let asd : any = [{ edzes_id: 1, edzes_neve: "string", datum: new Date("2024-11-12"), user_id: 1, ido: 12 }]

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [EdzesController],
      providers: [EdzesService, PrismaService],
    }).compile();


    edzesService = moduleRef.get(EdzesService);
    edzesController = moduleRef.get(EdzesController);
  });


  describe('findAll', () => {
    it('should return an array of edzes', async () => {
      const result: any = [{ edzes_id: 1, edzes_neve: "string", datum: new Date("2024-11-12"), user_id: 1, ido: 12 }];
      jest.spyOn(edzesService, 'findAll').mockImplementation(() => result);
      expect(await edzesController.findAll()).toBe(result);
    });
    it('should return an array', () => {
      jest.spyOn(edzesService, 'findAll').mockReturnValue(asd)
      expect(edzesController.findAll()).toBe(asd);
    });
  });
  

  /*
  describe('findOne', () => {
    it('should return an edzes', async () => {
      const result: any ={ edzes_id: 1, edzes_neve: "string", datum: new Date("2024-11-12"), user_id: 1, ido: 12 };
      jest.spyOn(edzesService, 'findOne').mockImplementation(() => result);

      expect(await edzesController.findOne(@Param('1'),)).toBe(result);
    });
  });
  */
});