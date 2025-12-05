import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('EventsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let guildId: number;
  let eventId: number;
  const timestamp = Date.now();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Register and login to get auth token and guild
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `events-test-${timestamp}@test.com`,
        password: 'Test123!@#',
        nickname: `EventsGuild${timestamp}`,
      });

    authToken = registerResponse.body.token;
    guildId = registerResponse.body.guild.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/events (POST)', () => {
    it('should create a new event', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      return request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          guildId,
          title: `Test Event ${timestamp}`,
          description: 'Test event description',
          date: futureDate.toISOString(),
          type: 'dungeon',
          maxParticipants: 20,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toContain('Test Event');
          expect(res.body.guildId).toBe(guildId);
          eventId = res.body.id;
        });
    });

    it('should fail without authentication', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      return request(app.getHttpServer())
        .post('/events')
        .send({
          guildId,
          title: 'Unauthorized Event',
          description: 'Test',
          date: futureDate.toISOString(),
          type: 'raid',
        })
        .expect(401);
    });

    it('should fail with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          guildId,
          // missing title and date
        })
        .expect(400);
    });
  });

  describe('/events/guild/:guildId (GET)', () => {
    it('should list events for a guild', () => {
      return request(app.getHttpServer())
        .get(`/events/guild/${guildId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('title');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get(`/events/guild/${guildId}`)
        .expect(401);
    });
  });

  describe('/events/:id (GET)', () => {
    it('should get event details', () => {
      return request(app.getHttpServer())
        .get(`/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', eventId);
          expect(res.body).toHaveProperty('title');
          expect(res.body).toHaveProperty('description');
        });
    });

    it('should fail with non-existent event', () => {
      return request(app.getHttpServer())
        .get('/events/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/events/:id (PATCH)', () => {
    it('should update event details', () => {
      return request(app.getHttpServer())
        .patch(`/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: `Updated Event ${timestamp}`,
          description: 'Updated description',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toContain('Updated Event');
          expect(res.body.description).toBe('Updated description');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/events/${eventId}`)
        .send({ title: 'Unauthorized Update' })
        .expect(401);
    });
  });

  describe('/events/:id/participants (POST)', () => {
    it('should add participant to event', () => {
      return request(app.getHttpServer())
        .post(`/events/${eventId}/participants`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'confirmed',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.status).toBe('confirmed');
        });
    });

    it('should fail with invalid status', () => {
      return request(app.getHttpServer())
        .post(`/events/${eventId}/participants`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'invalid-status',
        })
        .expect(400);
    });
  });

  describe('/events/:id/participants (GET)', () => {
    it('should list event participants', () => {
      return request(app.getHttpServer())
        .get(`/events/${eventId}/participants`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get(`/events/${eventId}/participants`)
        .expect(401);
    });
  });

  describe('/events/:id (DELETE)', () => {
    it('should delete event', () => {
      return request(app.getHttpServer())
        .delete(`/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should fail to get deleted event', () => {
      return request(app.getHttpServer())
        .get(`/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
