import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  const usersServiceMock = {
    findAll: jest.fn().mockResolvedValue([{ id: 'u1', email: 'user@test.com' }]),
    findOne: jest.fn().mockResolvedValue({ id: 'u1', email: 'user@test.com' }),
    findOneWithReviews: jest.fn().mockResolvedValue({ id: 'u1', email: 'user@test.com', reviews: [] }),
  } as Partial<UsersService>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersServiceMock }],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (GET) should require auth (401)', async () => {
    await request(app.getHttpServer()).get('/users').expect(401);
  });

  it('/users/:id (GET) should require auth (401)', async () => {
    await request(app.getHttpServer()).get('/users/some-id').expect(401);
  });
});

