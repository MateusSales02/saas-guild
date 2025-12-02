import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('GuildsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let guildId: number;
  let userId: string;
  const timestamp = Date.now();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Register and login to get auth token
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `guild-test-${timestamp}@test.com`,
        password: 'Test123!@#',
        nickname: `GuildTest${timestamp}`,
      });

    authToken = registerResponse.body.token;
    guildId = registerResponse.body.guild.id;
    userId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/guilds/:id (GET)', () => {
    it('should get guild details', () => {
      return request(app.getHttpServer())
        .get(`/guilds/${guildId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', guildId);
          expect(res.body).toHaveProperty('name');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer()).get(`/guilds/${guildId}`).expect(401);
    });

    it('should fail with non-existent guild', () => {
      return request(app.getHttpServer())
        .get('/guilds/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/guilds/:id (PATCH)', () => {
    it('should update guild name', () => {
      const newName = `UpdatedGuild${timestamp}`;
      return request(app.getHttpServer())
        .patch(`/guilds/${guildId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: newName })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(newName);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/guilds/${guildId}`)
        .send({ name: 'NewName' })
        .expect(401);
    });
  });

  describe('/guilds/:id/members (GET)', () => {
    it('should list guild members', () => {
      return request(app.getHttpServer())
        .get(`/guilds/${guildId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('userId', userId);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get(`/guilds/${guildId}/members`)
        .expect(401);
    });
  });

  describe('/guilds/:guildId/members (POST)', () => {
    it('should add a new member to guild', () => {
      return request(app.getHttpServer())
        .post(`/guilds/${guildId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nickname: `NewMember${timestamp}`,
          role: 'member',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('nickname');
          expect(res.body.role).toBe('member');
        });
    });

    it('should fail with invalid role', () => {
      return request(app.getHttpServer())
        .post(`/guilds/${guildId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nickname: 'InvalidMember',
          role: 'invalid-role',
        })
        .expect(400);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post(`/guilds/${guildId}/members`)
        .send({
          nickname: 'TestMember',
          role: 'member',
        })
        .expect(401);
    });
  });
});
