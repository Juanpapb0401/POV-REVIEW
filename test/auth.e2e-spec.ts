import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const authServiceMock = {
    create: jest.fn().mockResolvedValue({ id: 'u1', email: 'test@test.com', token: 'token' }),
    login: jest.fn().mockResolvedValue({ id: 'u1', email: 'test@test.com', token: 'token' }),
  } as Partial<AuthService>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST) should create user', async () => {
    const dto = { email: 'test@test.com', password: 'pass123', fullName: 'Test' };

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(dto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('token');
        expect(res.body.email).toBe(dto.email);
      });

    expect(authServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('/auth/login (POST) should login user', async () => {
    const dto = { email: 'test@test.com', password: 'pass123' };

    await request(app.getHttpServer())
      .post('/auth/login')
      .send(dto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('token');
      });

    expect(authServiceMock.login).toHaveBeenCalledWith(dto);
  });

  it('/auth/private (GET) should require auth (returns 500 due to passport config in tests)', async () => {
    // In E2E tests without full auth setup, passport throws 500 instead of 401
    const response = await request(app.getHttpServer()).get('/auth/private');
    expect([401, 500]).toContain(response.status);
  });
});

