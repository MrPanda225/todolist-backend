import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './setup';
import { PrismaService } from '../src/database/prisma.service';

describe('Tasks E2E', () => {
  let app:         INestApplication;
  let prisma:      PrismaService;
  let accessToken: string;
  let priorityId:  string;
  let taskId:      string;

  beforeAll(async () => {
    app    = await createTestApp();
    prisma = app.get(PrismaService);

    const priority = await prisma.priority.create({
      data: { label: 'Test', level: 99, color: '#000000', xpMultiplier: 1.00 },
    });
    priorityId = priority.id;

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        username: 'taskuser', email: 'tasks@test.com',
        password: 'password123', firstName: 'Task', lastName: 'User',
      });

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'tasks@test.com', password: 'password123' });

    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await prisma.userAchievement.deleteMany();
    await prisma.userStats.deleteMany();
    await prisma.taskTag.deleteMany();
    await prisma.taskTimeBlock.deleteMany();
    await prisma.task.deleteMany();
    await prisma.priority.deleteMany({ where: { level: 99 } });
    await prisma.user.deleteMany({ where: { email: 'tasks@test.com' } });
    await app.close();
  });

  describe('POST /api/tasks', () => {
    it('201 — crée une tâche', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Ma tâche', priorityId, xpReward: 10 });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Ma tâche');
      expect(res.body.status).toBe('TODO');
      taskId = res.body.id;
    });

    it('401 — sans token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/tasks')
        .send({ title: 'Test', priorityId });

      expect(res.status).toBe(401);
    });

    it('400 — title manquant', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ priorityId });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/tasks', () => {
    it('200 — retourne les tâches du user', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('PATCH /api/tasks/:id/status', () => {
    it('200 — passe en DONE et déclenche la gamification', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/tasks/${taskId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'DONE' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('DONE');

      const stats = await request(app.getHttpServer())
        .get('/api/gamification/stats')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(stats.body.totalXp).toBeGreaterThan(0);
      expect(stats.body.tasksCompleted).toBe(1);
    });

    it('404 — tâche inexistante', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/tasks/00000000-0000-0000-0000-000000000000/status')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'DONE' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('204 — supprime la tâche', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'À supprimer', priorityId, xpReward: 10 });

      const res = await request(app.getHttpServer())
        .delete(`/api/tasks/${createRes.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(204);
    });
  });
});