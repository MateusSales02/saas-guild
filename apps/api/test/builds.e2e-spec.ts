import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('BuildsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let guildId: number;
  let buildId: number;
  let classId: number;

  const testUser = {
    email: `builds-test-${Date.now()}@test.com`,
    password: 'Test123!@#',
    nickname: `BuildsGuild${Date.now()}`,
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

  describe('/builds/classes (GET)', () => {
    it('should list all classes', () => {
      return request(app.getHttpServer())
        .get('/builds/classes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          classId = res.body[0].id;
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer()).get('/builds/classes').expect(401);
    });
  });

  describe('/builds/items (GET)', () => {
    it('should list all items', () => {
      return request(app.getHttpServer())
        .get('/builds/items')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
        });
    });

    it('should filter items by slot', () => {
      return request(app.getHttpServer())
        .get('/builds/items?slot=MainHand')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((item: any) => {
            expect(item.slot).toBe('MainHand');
          });
        });
    });
  });

  describe('/builds (POST)', () => {
    it('should create a new build', () => {
      const buildData = {
        class_id: classId,
        spec_name: 'DPS Build',
        main_hand_id: null,
        off_hand_id: null,
        head_id: null,
        chest_id: null,
        shoes_id: null,
        cape_id: null,
        food_id: null,
        potion_id: null,
      };

      return request(app.getHttpServer())
        .post('/builds')
        .set('Authorization', `Bearer ${authToken}`)
        .send(buildData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.spec_name).toBe('DPS Build');
          buildId = res.body.id;
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/builds')
        .send({
          class_id: classId,
          spec_name: 'Test Build',
        })
        .expect(401);
    });
  });

  describe('/builds/:id (GET)', () => {
    it('should get a build by id', () => {
      return request(app.getHttpServer())
        .get(`/builds/${buildId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(buildId);
          expect(res.body).toHaveProperty('spec_name');
        });
    });

    it('should return 404 for non-existent build', () => {
      return request(app.getHttpServer())
        .get('/builds/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/builds/:id (PATCH)', () => {
    it('should update a build', () => {
      return request(app.getHttpServer())
        .patch(`/builds/${buildId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ spec_name: 'Updated Build' })
        .expect(200)
        .expect((res) => {
          expect(res.body.spec_name).toBe('Updated Build');
        });
    });
  });

  describe('/builds/:id (DELETE)', () => {
    it('should delete a build', () => {
      return request(app.getHttpServer())
        .delete(`/builds/${buildId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should return 404 after deletion', () => {
      return request(app.getHttpServer())
        .get(`/builds/${buildId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
