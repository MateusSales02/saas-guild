import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('FinanceController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let guildId: number;
  let transactionId: number;

  const testUser = {
    email: `finance-test-${Date.now()}@test.com`,
    password: 'Test123!@#',
    nickname: `FinanceGuild${Date.now()}`,
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/finance (POST)', () => {
    it('should create a new transaction', () => {
      const transactionData = {
        description: 'Guild tax collection',
        amount: 10000,
        type: 'income',
        category: 'tax',
        guildId: guildId,
      };

      return request(app.getHttpServer())
        .post('/finance')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.description).toBe('Guild tax collection');
          expect(res.body.amount).toBe('10000');
          expect(res.body.type).toBe('income');
          transactionId = res.body.id;
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/finance')
        .send({
          description: 'Test transaction',
          amount: 1000,
          type: 'income',
          guildId: guildId,
        })
        .expect(401);
    });

    it('should fail with invalid amount', () => {
      return request(app.getHttpServer())
        .post('/finance')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Invalid transaction',
          amount: -1000,
          type: 'income',
          guildId: guildId,
        })
        .expect(400);
    });
  });

  describe('/finance (GET)', () => {
    it('should list all transactions for a guild', () => {
      return request(app.getHttpServer())
        .get(`/finance?guildId=${guildId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('amount');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get(`/finance?guildId=${guildId}`)
        .expect(401);
    });
  });

  describe('/finance/summary (GET)', () => {
    it('should get financial summary', () => {
      return request(app.getHttpServer())
        .get(`/finance/summary?guildId=${guildId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('total_income');
          expect(res.body).toHaveProperty('total_expense');
          expect(res.body).toHaveProperty('balance');
        });
    });
  });

  describe('/finance/daily-history (GET)', () => {
    it('should get daily history', () => {
      return request(app.getHttpServer())
        .get(`/finance/daily-history?guildId=${guildId}&days=7`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/finance/:id (DELETE)', () => {
    it('should soft delete a transaction', () => {
      return request(app.getHttpServer())
        .delete(`/finance/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should not show deleted transaction in list', () => {
      return request(app.getHttpServer())
        .get(`/finance?guildId=${guildId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          const deleted = res.body.find((t: any) => t.id === transactionId);
          expect(deleted).toBeUndefined();
        });
    });
  });

  describe('/finance/:id/restore (PATCH)', () => {
    it('should restore a deleted transaction', () => {
      return request(app.getHttpServer())
        .patch(`/finance/${transactionId}/restore`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should show restored transaction in list', () => {
      return request(app.getHttpServer())
        .get(`/finance?guildId=${guildId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          const restored = res.body.find((t: any) => t.id === transactionId);
          expect(restored).toBeDefined();
        });
    });
  });

  describe('/finance/:id/hard (DELETE)', () => {
    it('should hard delete a transaction', () => {
      return request(app.getHttpServer())
        .delete(`/finance/${transactionId}/hard`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
