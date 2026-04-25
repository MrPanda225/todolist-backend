import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './setup';
import { PrismaService } from '../src/database/prisma.service';

describe('Auth E2E', () => {
  let app:    INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app    = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.userAchievement.deleteMany();
    await prisma.userStats.deleteMany();
    await prisma.taskTag.deleteMany();
    await prisma.taskTimeBlock.deleteMany();
    await prisma.task.deleteMany();
    await prisma.timeBlock.deleteMany();
    await prisma.category.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('201 — crée un user et retourne un accessToken', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username:  'testuser',
          email:     'test@test.com',
          password:  'password123',
          firstName: 'John',
          lastName:  'Doe',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(typeof res.body.accessToken).toBe('string');
    });

    it('409 — email déjà utilisé', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username:  'testuser2',
          email:     'test@test.com',
          password:  'password123',
          firstName: 'Jane',
          lastName:  'Doe',
        });

      expect(res.status).toBe(409);
    });

    it('400 — body invalide', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'notanemail' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('200 — retourne accessToken et cookie refresh_token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toContain('refresh_token');
      expect(res.headers['set-cookie'][0]).toContain('HttpOnly');
    });

    it('401 — mauvais mot de passe', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('ne retourne pas passwordHash', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password123' });

      expect(JSON.stringify(res.body)).not.toContain('passwordHash');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('200 — retourne un nouvel accessToken depuis le cookie', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password123' });

      const rawCookie  = loginRes.headers['set-cookie'][0];
      const cookieValue = rawCookie.split(';')[0];

      const res = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', cookieValue);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
    });

    it('401 — sans cookie refresh_token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/refresh');

      expect(res.status).toBe(401);
    });
  });
});