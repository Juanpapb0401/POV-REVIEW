import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let service: jest.Mocked<ReviewsService>;

  const mockUser = { id: 'u1', email: 'a@a.com' } as any;

  beforeEach(async () => {
    const serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getMovieReviews: jest.fn(),
      getUserReviews: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [{ provide: ReviewsService, useValue: serviceMock }],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
    service = module.get(ReviewsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create', async () => {
    const dto = { name: 'Test', rating: 5, comment: 'Good' } as any;
    service.create.mockResolvedValue({ id: 'r1' } as any);
    await expect(controller.create(dto, mockUser)).resolves.toEqual({ id: 'r1' });
    expect(service.create).toHaveBeenCalledWith(dto, mockUser);
  });

  it('should call service.create with movieId from params', async () => {
    const dto = { name: 'Test', rating: 5, comment: 'Good' } as any;
    service.create.mockResolvedValue({ id: 'r1' } as any);
    await controller.createForMovie('m1', dto, mockUser);
    expect(dto.movieId).toBe('m1');
    expect(service.create).toHaveBeenCalledWith(dto, mockUser);
  });

  it('should call service.findAll', async () => {
    service.findAll.mockResolvedValue([]);
    await expect(controller.findAll()).resolves.toEqual([]);
  });

  it('should call service.getMovieReviews', async () => {
    service.getMovieReviews.mockResolvedValue([]);
    await expect(controller.getMovieReviews('m1')).resolves.toEqual([]);
  });

  it('should call service.getUserReviews', async () => {
    service.getUserReviews.mockResolvedValue([]);
    await expect(controller.getUserReviews('u1')).resolves.toEqual([]);
  });

  it('should call service.findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'r1' } as any);
    await expect(controller.findOne('r1')).resolves.toEqual({ id: 'r1' });
  });

  it('should call service.update', async () => {
    const dto = { comment: 'Updated' } as any;
    service.update.mockResolvedValue({ id: 'r1', comment: 'Updated' } as any);
    await expect(controller.update('r1', dto, mockUser)).resolves.toEqual({ id: 'r1', comment: 'Updated' });
  });

  it('should call service.remove', async () => {
    service.remove.mockResolvedValue({ message: 'deleted' });
    await expect(controller.remove('r1', mockUser)).resolves.toEqual({ message: 'deleted' });
  });
});

