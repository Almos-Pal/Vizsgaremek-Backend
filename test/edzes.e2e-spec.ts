import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { CreateEdzesDto } from '../src/edzes/dto/create-edzes.dto';
import { jest, describe, expect, it, beforeAll, beforeEach, afterAll } from '@jest/globals';

describe('EdzesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    // Clean up the database before each test
    await prisma.edzes_Gyakorlat_Set.deleteMany();
    await prisma.edzes_Gyakorlat.deleteMany();
    await prisma.edzes.deleteMany();
    await prisma.user_Gyakorlat_History.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/edzes (POST)', () => {
    it('should create a new edzes', async () => {
      // First create a test user
      const user = await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@test.com',
          password: 'password123'
        }
      });

      const createEdzesDto: CreateEdzesDto = {
        edzes_neve: 'Test Workout',
        user_id: user.user_id,
        datum: new Date().toISOString(),
        ido: 60,
        isTemplate: false
      };

      const response = await request(app.getHttpServer())
        .post('/edzes')
        .send(createEdzesDto)
        .expect(201);

      expect(response.body).toHaveProperty('edzes_id');
      expect(response.body.edzes_neve).toBe(createEdzesDto.edzes_neve);
    });

    it('should not create edzes with invalid user_id', async () => {
      const createEdzesDto: CreateEdzesDto = {
        edzes_neve: 'Test Workout',
        user_id: 999999, // Non-existent user ID
        datum: new Date().toISOString(),
        ido: 60,
        isTemplate: false
      };

      await request(app.getHttpServer())
        .post('/edzes')
        .send(createEdzesDto)
        .expect(404);
    });
  });

  describe('/edzes/:id (GET)', () => {
    it('should return an edzes by id', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          username: 'testuser2',
          email: 'test2@test.com',
          password: 'password123'
        }
      });

      // Create test edzes
      const edzes = await prisma.edzes.create({
        data: {
          edzes_neve: 'Test Workout',
          user_id: user.user_id,
          datum: new Date(),
          ido: 60,
          isTemplate: false
        }
      });

      const response = await request(app.getHttpServer())
        .get(`/edzes/${edzes.edzes_id}`)
        .expect(200);

      expect(response.body.edzes_neve).toBe(edzes.edzes_neve);
    });

    it('should return 404 for non-existent edzes', async () => {
      await request(app.getHttpServer())
        .get('/edzes/999999')
        .expect(404);
    });
  });

  describe('/edzes/:id/finalize/:userId (PATCH)', () => {
    it('should finalize an edzes', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          username: 'testuser3',
          email: 'test3@test.com',
          password: 'password123'
        }
      });

      // Create test edzes
      const edzes = await prisma.edzes.create({
        data: {
          edzes_neve: 'Test Workout',
          user_id: user.user_id,
          datum: new Date(),
          ido: 60,
          isTemplate: false,
          isFinalized: false
        }
      });

      const response = await request(app.getHttpServer())
        .patch(`/edzes/${edzes.edzes_id}/finalize/${user.user_id}`)
        .send({ finalized: true })
        .expect(200);

      expect(response.body.isFinalized).toBe(true);
    });
  });

  describe('/edzes/:id/gyakorlat/:userId (POST)', () => {
    it('should add gyakorlat to edzes', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          username: 'testuser4',
          email: 'test4@test.com',
          password: 'password123'
        }
      });

      // Create test gyakorlat
      const gyakorlat = await prisma.gyakorlat.create({
        data: {
          gyakorlat_neve: 'Test Exercise',
          eszkoz: 'Test Equipment'
        }
      });

      // Create test edzes
      const edzes = await prisma.edzes.create({
        data: {
          edzes_neve: 'Test Workout',
          user_id: user.user_id,
          datum: new Date(),
          ido: 60,
          isTemplate: false
        }
      });

      const response = await request(app.getHttpServer())
        .post(`/edzes/${edzes.edzes_id}/gyakorlat/${user.user_id}`)
        .send({ gyakorlat_id: gyakorlat.gyakorlat_id })
        .expect(201);

      expect(response.body.gyakorlatok).toHaveLength(1);
      expect(response.body.gyakorlatok[0].gyakorlat_id).toBe(gyakorlat.gyakorlat_id);
    });
  });
}); 