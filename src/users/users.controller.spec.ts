import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma.service';
import { query } from 'express';
import { GetUserQueryDto, UserResponseDto } from './dto/user.dto';
import { PaginationMetaDto } from 'src/common/dto';
import { User } from './entities/user.entity';
const mockDto:GetUserQueryDto = {
  page: 1,
  limit: 10,

}
const mockMeta:PaginationMetaDto= {
  currentPage: 1,
  itemsPerPage :10,
  totalItems: 1,
  totalPages: 1
}
const mockData:User[] = [
  {
    user_id: 1,
    username: 'test',
    email: 'user@gmail.com',
    password: 'User123.',
    isAdmin: true,
    suly: 80,
    magassag: 180
  }
]
const response:UserResponseDto = {
  items {

  },
  meta: mockMeta
}
describe('UsersController', () => {
  let userController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService, PrismaService],
    }).compile();

    userController = module.get<UsersController>(UsersController);
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = ['test'];
      jest.spyOn(usersService, 'findAll').mockImplementation(() =>   result);

      expect(await usersService.findAll(mockDto)).toBe(result);
    });
  });


});
