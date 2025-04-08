import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { CreateEdzesDto } from '../src/edzes/dto/create-edzes.dto';
import { jest, describe, expect, it, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { JwtService } from '@nestjs/jwt';

describe('EdzesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let testUser: any;
  let authToken: string;

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
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await app.init();
  });

  beforeEach(async () => {
    // Clean up the database before each test
    
    await prisma.$transaction([
      prisma.edzes_Gyakorlat_Set.deleteMany(),
      prisma.edzes_Gyakorlat.deleteMany(),
      prisma.user_Gyakorlat_History.deleteMany(),
      prisma.user_Gyakorlat.deleteMany(), 
      prisma.edzes.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    // Create a test user and generate JWT token
    testUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123',
        isAdmin: false
      }
    });

    authToken = jwtService.sign({ 
      sub: testUser.user_id, 
      username: testUser.username,
      user_id: testUser.user_id,
      isAdmin: testUser.isAdmin
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/edzes (POST)', () => {
    it('should create a new edzes', async () => {
      const createEdzesDto: CreateEdzesDto = {
        edzes_neve: 'Test Workout',
        user_id: testUser.user_id,
        datum: new Date().toISOString(),
        ido: 60,
        isTemplate: false
      };

      const response = await request(app.getHttpServer())
        .post('/edzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createEdzesDto)
        .expect(201);

      expect(response.body).toHaveProperty('edzes_id');
      expect(response.body.edzes_neve).toBe(createEdzesDto.edzes_neve);
    });

    it('should return 401 when not authenticated', async () => {
      const createEdzesDto: CreateEdzesDto = {
        edzes_neve: 'Test Workout',
        user_id: testUser.user_id,
        datum: new Date().toISOString(),
        ido: 60,
        isTemplate: false
      };

      await request(app.getHttpServer())
        .post('/edzes')
        .send(createEdzesDto)
        .expect(401);
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
        .set('Authorization', `Bearer ${authToken}`)
        .send(createEdzesDto)
        .expect(403);

      expect(response.body.message).toContain('Felhasználói azonosító nem egyezik');
    });

    it('should not create edzes with invalid data', async () => {
      const invalidDto = {
        edzes_neve: '',
        user_id: testUser.user_id,
        ido: -1,
      };

      const response = await request(app.getHttpServer())
        .post('/edzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
    });
  });

  describe('/edzes (GET)', () => {
    it('should return user\'s edzesek', async () => {
      // First create a test edzes
      await prisma.edzes.create({
        data: {
          edzes_neve: 'Test Workout',
          user_id: testUser.user_id,
          datum: new Date(),
          ido: 60,
          isTemplate: false
        }
      });

      const response = await request(app.getHttpServer())
        .get('/edzes')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ userId: testUser.user_id })
        .expect(200);

      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items[0]).toHaveProperty('edzes_id');
      expect(response.body.items[0].edzes_neve).toBe('Test Workout');
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/edzes')
        .expect(401);
    });
  });

  describe('/edzes/:id (GET)', () => {
    it('should return a specific edzes', async () => {
      // First create a test edzes
      const edzes = await prisma.edzes.create({
        data: {
          edzes_neve: 'Test Workout',
          user_id: testUser.user_id,
          datum: new Date(),
          ido: 60,
          isTemplate: false
        }
      });

      const response = await request(app.getHttpServer())
        .get(`/edzes/${edzes.edzes_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('edzes_id', edzes.edzes_id);
      expect(response.body.edzes_neve).toBe('Test Workout');
    });

    it('should return 404 when edzes not found', async () => {
      await request(app.getHttpServer())
        .get('/edzes/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/edzes/1')
        .expect(401);
    });
  });

  describe('/edzes/:id/finalize/:userId (PATCH)', () => {
    it('should finalize an edzes', async () => {
      const edzes = await prisma.edzes.create({
        data: {
          edzes_neve: 'Test Workout',
          user_id: testUser.user_id,
          datum: new Date(),
          ido: 60,
          isTemplate: false,
          isFinalized: false
        }
      });

      const response = await request(app.getHttpServer())
        .patch(`/edzes/${edzes.edzes_id}/finalize/${testUser.user_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ finalized: true })
        .expect(200);

      expect(response.body.isFinalized).toBe(true);
    });

    it('should not finalize edzes of another user', async () => {
      const user2 = await prisma.user.create({
        data: {
          username: 'user2',
          email: 'user2@test.com',
          password: 'password123',
          isAdmin: false
        }
      });

      const edzes = await prisma.edzes.create({
        data: {
          edzes_neve: 'Test Workout',
          user_id: testUser.user_id,
          datum: new Date(),
          ido: 60,
          isTemplate: false,
          isFinalized: false
        }
      });

      await request(app.getHttpServer())
        .patch(`/edzes/${edzes.edzes_id}/finalize/${user2.user_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ finalized: true })
        .expect(403);
    });
  });

  describe('/edzes/:id/gyakorlat/:userId (POST)', () => {
    it('should add gyakorlat to edzes', async () => {
      const gyakorlat = await prisma.gyakorlat.create({
        data: {
          gyakorlat_neve: 'Test Exercise',
          eszkoz: 'Test Equipment'
        }
      });

      const edzes = await prisma.edzes.create({
        data: {
          edzes_neve: 'Test Workout',
          user_id: testUser.user_id,
          datum: new Date(),
          ido: 60,
          isTemplate: false
        }
      });

      const response = await request(app.getHttpServer())
        .post(`/edzes/${edzes.edzes_id}/gyakorlat/${testUser.user_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ gyakorlat_id: gyakorlat.gyakorlat_id })
        .expect(201);

      expect(response.body.gyakorlatok).toHaveLength(1);
      expect(response.body.gyakorlatok[0].gyakorlat_id).toBe(gyakorlat.gyakorlat_id);
    });

    it('should not add duplicate gyakorlat to edzes', async () => {
      const gyakorlat = await prisma.gyakorlat.create({
        data: {
          gyakorlat_neve: 'Test Exercise',
          eszkoz: 'Test Equipment'
        }
      });

      const edzes = await prisma.edzes.create({
        data: {
          edzes_neve: 'Test Workout',
          user_id: testUser.user_id,
          datum: new Date(),
          ido: 60,
          isTemplate: false
        }
      });

      // Add gyakorlat first time
      await request(app.getHttpServer())
        .post(`/edzes/${edzes.edzes_id}/gyakorlat/${testUser.user_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ gyakorlat_id: gyakorlat.gyakorlat_id })
        .expect(201);

      // Try to add the same gyakorlat again
      const response = await request(app.getHttpServer())
        .post(`/edzes/${edzes.edzes_id}/gyakorlat/${testUser.user_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ gyakorlat_id: gyakorlat.gyakorlat_id })
        .expect(409);

      expect(response.body.message).toContain('már hozzá van adva');
    });
  });

  describe('/edzes/:id/gyakorlat/:gyakorlatId/:userId (DELETE)', () => {
    it('should remove gyakorlat from edzes', async () => {
      const gyakorlat = await prisma.gyakorlat.create({
        data: {
          gyakorlat_neve: 'Test Exercise',
          eszkoz: 'Test Equipment'
        }
      });

      const edzes = await prisma.edzes.create({
        data: {
          edzes_neve: 'Test Workout',
          user_id: testUser.user_id,
          datum: new Date(),
          ido: 60,
          isTemplate: false
        }
      });

      // Add gyakorlat first
      await request(app.getHttpServer())
        .post(`/edzes/${edzes.edzes_id}/gyakorlat/${testUser.user_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ gyakorlat_id: gyakorlat.gyakorlat_id })
        .expect(201);

      // Then remove it
      await request(app.getHttpServer())
        .delete(`/edzes/${edzes.edzes_id}/gyakorlat/${gyakorlat.gyakorlat_id}/${testUser.user_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify it's removed
      const response = await request(app.getHttpServer())
        .get(`/edzes/${edzes.edzes_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.gyakorlatok).toHaveLength(0);
    });
  });
}); 