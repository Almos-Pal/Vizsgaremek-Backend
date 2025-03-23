import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateEdzesDto } from '../src/edzes/dto/create-edzes.dto';
import { jest, describe, expect, it, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { PrismaService } from '../src/prisma.service';

describe('EdzesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));
    
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    // Clean up the database before each test
    await prisma.$transaction([
      prisma.edzes_Gyakorlat_Set.deleteMany(),
      prisma.edzes_Gyakorlat.deleteMany(),
      prisma.user_Gyakorlat_History.deleteMany(),
      prisma.user_Gyakorlat.deleteMany(),
      prisma.gyakorlat_Izomcsoport.deleteMany(),
      prisma.edzes.deleteMany(),
      prisma.gyakorlat.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/edzes (POST)', () => {
    it('should create a new edzes', async () => {
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
      expect(response.body.isTemplate).toBe(createEdzesDto.isTemplate);
    });

    it('should not create edzes with invalid user_id', async () => {
      const createEdzesDto: CreateEdzesDto = {
        edzes_neve: 'Test Workout',
        user_id: 999999,
        datum: new Date().toISOString(),
        ido: 60,
        isTemplate: false
      };

      const response = await request(app.getHttpServer())
        .post('/edzes')
        .send(createEdzesDto)
        .expect(404);

      expect(response.body.message).toContain('nem található');
    });

    it('should not create edzes with invalid data', async () => {
      const invalidDto = {
        edzes_neve: '', // Empty name
        user_id: 1,
        ido: -1, // Invalid duration
      };

      const response = await request(app.getHttpServer())
        .post('/edzes')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
    });
  });

  describe('/edzes/:id (GET)', () => {
    it('should return an edzes by id', async () => {
      const user = await prisma.user.create({
        data: {
          username: 'testuser2',
          email: 'test2@test.com',
          password: 'password123'
        }
      });

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
      expect(response.body.isTemplate).toBe(edzes.isTemplate);
    });

    it('should return 404 for non-existent edzes', async () => {
      const response = await request(app.getHttpServer())
        .get('/edzes/999999')
        .expect(404);

      expect(response.body.message).toContain('nem található');
    });
  });

  describe('/edzes/:id/finalize/:userId (PATCH)', () => {
    it('should finalize an edzes', async () => {
      const user = await prisma.user.create({
        data: {
          username: 'testuser3',
          email: 'test3@test.com',
          password: 'password123'
        }
      });

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

    it('should not finalize edzes of another user', async () => {
      const user1 = await prisma.user.create({
        data: {
          username: 'user1',
          email: 'user1@test.com',
          password: 'password123'
        }
      });

      const user2 = await prisma.user.create({
        data: {
          username: 'user2',
          email: 'user2@test.com',
          password: 'password123'
        }
      });

      const edzes = await prisma.edzes.create({
        data: {
          edzes_neve: 'Test Workout',
          user_id: user1.user_id,
          datum: new Date(),
          ido: 60,
          isTemplate: false,
          isFinalized: false
        }
      });

      await request(app.getHttpServer())
        .patch(`/edzes/${edzes.edzes_id}/finalize/${user2.user_id}`)
        .send({ finalized: true })
        .expect(404);
    });
  });

  describe('/edzes/:id/gyakorlat/:userId (POST)', () => {
    it('should add gyakorlat to edzes', async () => {
      const user = await prisma.user.create({
        data: {
          username: 'testuser4',
          email: 'test4@test.com',
          password: 'password123'
        }
      });

      const gyakorlat = await prisma.gyakorlat.create({
        data: {
          gyakorlat_neve: 'Test Exercise',
          eszkoz: 'Test Equipment'
        }
      });

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

    it('should not add duplicate gyakorlat to edzes', async () => {
      const user = await prisma.user.create({
        data: {
          username: 'testuser5',
          email: 'test5@test.com',
          password: 'password123'
        }
      });

      const gyakorlat = await prisma.gyakorlat.create({
        data: {
          gyakorlat_neve: 'Test Exercise',
          eszkoz: 'Test Equipment'
        }
      });

      const edzes = await prisma.edzes.create({
        data: {
          edzes_neve: 'Test Workout',
          user_id: user.user_id,
          datum: new Date(),
          ido: 60,
          isTemplate: false
        }
      });

      // Add gyakorlat first time
      await request(app.getHttpServer())
        .post(`/edzes/${edzes.edzes_id}/gyakorlat/${user.user_id}`)
        .send({ gyakorlat_id: gyakorlat.gyakorlat_id })
        .expect(201);

      // Try to add the same gyakorlat again
      const response = await request(app.getHttpServer())
        .post(`/edzes/${edzes.edzes_id}/gyakorlat/${user.user_id}`)
        .send({ gyakorlat_id: gyakorlat.gyakorlat_id })
        .expect(409);

      expect(response.body.message).toContain('már hozzá van adva');
    });
  });

  describe('/edzes/:id/gyakorlat/:gyakorlatId/:userId (DELETE)', () => {
    it('should remove gyakorlat from edzes', async () => {
      const user = await prisma.user.create({
        data: {
          username: 'testuser6',
          email: 'test6@test.com',
          password: 'password123'
        }
      });

      const gyakorlat = await prisma.gyakorlat.create({
        data: {
          gyakorlat_neve: 'Test Exercise',
          eszkoz: 'Test Equipment'
        }
      });

      const edzes = await prisma.edzes.create({
        data: {
          edzes_neve: 'Test Workout',
          user_id: user.user_id,
          datum: new Date(),
          ido: 60,
          isTemplate: false
        }
      });

      // Add gyakorlat first
      await request(app.getHttpServer())
        .post(`/edzes/${edzes.edzes_id}/gyakorlat/${user.user_id}`)
        .send({ gyakorlat_id: gyakorlat.gyakorlat_id })
        .expect(201);

      // Then remove it
      await request(app.getHttpServer())
        .delete(`/edzes/${edzes.edzes_id}/gyakorlat/${gyakorlat.gyakorlat_id}/${user.user_id}`)
        .expect(200);

      // Verify it's removed
      const response = await request(app.getHttpServer())
        .get(`/edzes/${edzes.edzes_id}`)
        .expect(200);

      expect(response.body.gyakorlatok).toHaveLength(0);
    });
  });
}); 