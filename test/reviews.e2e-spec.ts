import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ReviewsController } from '../src/reviews/reviews.controller';
import { ReviewsService } from '../src/reviews/reviews.service';

describe('ReviewsController (e2e)', () => {
  let app: INestApplication;

  const reviewsServiceMock = {
    findAll: jest.fn().mockResolvedValue([{ id: 'r1', comment: 'Great' }]),
    getMovieReviews: jest.fn().mockResolvedValue([{ id: 'r1', comment: 'Great' }]),
    getUserReviews: jest.fn().mockResolvedValue([{ id: 'r1', comment: 'Great' }]),
  } as Partial<ReviewsService>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        { provide: ReviewsService, useValue: reviewsServiceMock },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/reviews (GET) should return list', async () => {
    await request(app.getHttpServer())
      .get('/reviews')
      .expect(200)
      .expect(res => {
        expect(res.body).toEqual([{ id: 'r1', comment: 'Great' }]);
      });
  });

  it('/reviews (POST) should require auth (401)', async () => {
    await request(app.getHttpServer())
      .post('/reviews')
      .send({})
      .expect(401);
  });
});


