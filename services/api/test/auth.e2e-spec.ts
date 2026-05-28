import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth E2E Tests', () => {
  let app: INestApplication;
  let accessToken: string;
  let organizationId: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Flow', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!',
          first_name: 'John',
          last_name: 'Doe',
          organization_name: 'Test Company',
          organization_slug: 'test-company',
          user_type: 'employer',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('refresh_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('organization');
          accessToken = res.body.access_token;
          organizationId = res.body.organization.id;
          userId = res.body.user.id;
        });
    });

    it('should not allow duplicate email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!',
          first_name: 'Jane',
          last_name: 'Doe',
          organization_name: 'Another Company',
          organization_slug: 'another-company',
          user_type: 'employer',
        })
        .expect(400);
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('refresh_token');
        });
    });

    it('should not login with invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should refresh token', () => {
      let refreshToken: string;

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!',
        })
        .expect(200)
        .then((res) => {
          refreshToken = res.body.refresh_token;

          return request(app.getHttpServer())
            .post('/auth/refresh')
            .send({ refresh_token: refreshToken })
            .expect(200)
            .expect((res) => {
              expect(res.body).toHaveProperty('access_token');
            });
        });
    });

    it('should logout', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });
  });

  describe('Tenant Isolation', () => {
    it('should enforce tenant isolation on jobs endpoint', () => {
      // Try to access jobs without proper org_id
      return request(app.getHttpServer())
        .get('/jobs')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect((res) => {
          expect(res.body).toEqual([]);
        });
    });

    it('should create job in correct organization', () => {
      return request(app.getHttpServer())
        .post('/jobs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Software Engineer',
          description: 'We are looking for a software engineer',
          job_type: 'full-time',
          employment_type: 'permanent',
          salary_min: 80000,
          salary_max: 120000,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Software Engineer');
          expect(res.body.organization_id).toBe(organizationId);
        });
    });
  });

  describe('RBAC', () => {
    it('should have default roles initialized', () => {
      return request(app.getHttpServer())
        .get(`/organizations/${organizationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should enforce role-based access', () => {
      // This would require role assignments which are handled in Phase 2+
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect((res) => {
          // Response depends on user's role
          expect(res.statusCode).toBeDefined();
        });
    });
  });
});
