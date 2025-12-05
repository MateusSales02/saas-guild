import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('ReportsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let guildId: number;

  const testUser = {
    email: `reports-test-${Date.now()}@test.com`,
    password: 'Test123!@#',
    nickname: `ReportsGuild${Date.now()}`,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Registra usuário e obtém token
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    authToken = registerRes.body.token;
    guildId = registerRes.body.guild.id;

    // Cria algumas transações para gerar dados nos relatórios
    await request(app.getHttpServer())
      .post('/finance')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: 'Income test',
        amount: 5000,
        type: 'income',
        category: 'tax',
        guildId: guildId,
      });

    await request(app.getHttpServer())
      .post('/finance')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: 'Expense test',
        amount: 2000,
        type: 'expense',
        category: 'supplies',
        guildId: guildId,
      });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/reports/overview (GET)', () => {
    it('should get overview report for guild', () => {
      return request(app.getHttpServer())
        .get(`/reports/overview?guildId=${guildId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('guild');
          expect(res.body).toHaveProperty('members');
          expect(res.body).toHaveProperty('finance');
          expect(res.body).toHaveProperty('events');
          expect(res.body).toHaveProperty('builds');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get(`/reports/overview?guildId=${guildId}`)
        .expect(401);
    });

    it('should fail without guildId', () => {
      return request(app.getHttpServer())
        .get('/reports/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('/reports/finance-trends (GET)', () => {
    it('should get finance trends for guild', () => {
      return request(app.getHttpServer())
        .get(`/reports/finance-trends?guildId=${guildId}&days=30`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('daily');
          expect(res.body).toHaveProperty('summary');
          expect(Array.isArray(res.body.daily)).toBe(true);
        });
    });

    it('should default to 30 days if not specified', () => {
      return request(app.getHttpServer())
        .get(`/reports/finance-trends?guildId=${guildId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('daily');
          expect(res.body).toHaveProperty('summary');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get(`/reports/finance-trends?guildId=${guildId}`)
        .expect(401);
    });
  });

  describe('/reports/activity-stats (GET)', () => {
    it('should get activity stats for guild', () => {
      return request(app.getHttpServer())
        .get(`/reports/activity-stats?guildId=${guildId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('total_members');
          expect(res.body).toHaveProperty('total_events');
          expect(res.body).toHaveProperty('total_builds');
          expect(res.body).toHaveProperty('events_by_type');
          expect(typeof res.body.total_members).toBe('number');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get(`/reports/activity-stats?guildId=${guildId}`)
        .expect(401);
    });
  });

  describe('/reports/export/:format (GET)', () => {
    it('should export report in PDF format', () => {
      return request(app.getHttpServer())
        .get(`/reports/export/pdf?guildId=${guildId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect('Content-Type', /application\/pdf/);
    });

    it('should export report in CSV format', () => {
      return request(app.getHttpServer())
        .get(`/reports/export/csv?guildId=${guildId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect('Content-Type', /text\/csv/);
    });

    it('should fail with invalid format', () => {
      return request(app.getHttpServer())
        .get(`/reports/export/invalid?guildId=${guildId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get(`/reports/export/pdf?guildId=${guildId}`)
        .expect(401);
    });
  });
});
