import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Movie } from '../movies/entities/movie.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewRepo: jest.Mocked<Repository<Review>>;
  let movieRepo: jest.Mocked<Repository<Movie>>;

  const user = { id: 'user-1', email: 'a@a.com' } as any;

  beforeEach(async () => {
    const reviewRepoMock: Partial<Record<keyof Repository<Review>, jest.Mock>> = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const movieRepoMock: Partial<Record<keyof Repository<Movie>, jest.Mock>> = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: getRepositoryToken(Review), useValue: reviewRepoMock },
        { provide: getRepositoryToken(Movie), useValue: movieRepoMock },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    reviewRepo = module.get(getRepositoryToken(Review));
    movieRepo = module.get(getRepositoryToken(Movie));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a review when movie exists and not reviewed before', async () => {
      const dto = { movieId: 'm1', name: 'n', rating: 5, comment: 'c' } as any;
      const movie = { id: 'm1' } as Movie;
      const review = { id: 'r1', ...dto, movie, user } as any;

      (movieRepo.findOneBy as any).mockResolvedValue(movie);
      reviewRepo.findOne.mockResolvedValueOnce(null as any);
      reviewRepo.create.mockReturnValue(review);
      reviewRepo.save.mockResolvedValue(review);
      reviewRepo.findOne.mockResolvedValueOnce({ ...review, user: { ...user }, movie } as any);

      const result = await service.create(dto, user);

      expect(movieRepo.findOneBy).toHaveBeenCalledWith({ id: dto.movieId });
      expect(reviewRepo.create).toHaveBeenCalled();
      expect(reviewRepo.save).toHaveBeenCalled();
      expect(result?.id).toBe('r1');
      expect((result as any).user?.password).toBeUndefined();
    });

    it('should throw NotFoundException when movie does not exist', async () => {
      const dto = { movieId: 'missing' } as any;
      (movieRepo.findOneBy as any).mockResolvedValue(null);
      await expect(service.create(dto, user)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw BadRequestException when user already reviewed', async () => {
      const dto = { movieId: 'm1' } as any;
      const movie = { id: 'm1' } as Movie;
      (movieRepo.findOneBy as any).mockResolvedValue(movie);
      reviewRepo.findOne.mockResolvedValue({ id: 'existing' } as any);
      await expect(service.create(dto, user)).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return reviews and sanitize nested fields', async () => {
      const reviews = [
        { id: 'r1', user: { id: 'u1', password: 'x' }, movie: { id: 'm1', reviews: [{}] as any } } as any,
      ];
      reviewRepo.find.mockResolvedValue(reviews);
      const result = await service.findAll();
      expect(result[0].user.password).toBeUndefined();
      expect((result[0].movie as any).reviews).toBeUndefined();
    });

    it('should handle empty reviews list', async () => {
      reviewRepo.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });

    it('should handle reviews without nested user', async () => {
      const reviews = [{ id: 'r1', user: null, movie: null } as any];
      reviewRepo.find.mockResolvedValue(reviews);
      const result = await service.findAll();
      expect(result[0]).toEqual({ id: 'r1', user: null, movie: null });
    });
  });

  describe('findOne', () => {
    it('should validate id format', async () => {
      await expect(service.findOne('not-a-uuid')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should throw when not found', async () => {
      const id = '2d931510-d99f-494a-8c67-87feb05e1594';
      reviewRepo.findOne.mockResolvedValue(null as any);
      await expect(service.findOne(id)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should return review and sanitize when user and movie exist', async () => {
      const id = '2d931510-d99f-494a-8c67-87feb05e1594';
      const review = {
        id,
        user: { id: 'u1', password: 'secret' },
        movie: { id: 'm1', reviews: [{}] },
      } as any;
      reviewRepo.findOne.mockResolvedValue(review);
      const result = await service.findOne(id);
      expect(result.user.password).toBeUndefined();
      expect((result.movie as any).reviews).toBeUndefined();
    });

    it('should return review when user is null', async () => {
      const id = '2d931510-d99f-494a-8c67-87feb05e1594';
      const review = { id, user: null, movie: null } as any;
      reviewRepo.findOne.mockResolvedValue(review);
      const result = await service.findOne(id);
      expect(result).toEqual(review);
    });

    it('should return review with user but no movie', async () => {
      const id = '2d931510-d99f-494a-8c67-87feb05e1594';
      const review = { id, user: { id: 'u1', password: 'x' }, movie: null } as any;
      reviewRepo.findOne.mockResolvedValue(review);
      const result = await service.findOne(id);
      expect(result.user.password).toBeUndefined();
      expect(result.movie).toBeNull();
    });
  });

  describe('update', () => {
    it('should update only own review', async () => {
      const id = '2d931510-d99f-494a-8c67-87feb05e1594';
      const review = { id, user: { id: user.id } } as any;
      reviewRepo.findOne.mockResolvedValueOnce(review);
      const saved = { ...review } as any;
      reviewRepo.save.mockResolvedValue(saved);
      reviewRepo.findOne.mockResolvedValueOnce({ ...saved, user: { id: user.id }, movie: {} } as any);
      const result = await service.update(id, { comment: 'upd' } as any, user);
      expect(result!.id).toBe(id);
    });

    it('should reject updating others reviews', async () => {
      const id = '2d931510-d99f-494a-8c67-87feb05e1594';
      reviewRepo.findOne.mockResolvedValue({ id, user: { id: 'other' } } as any);
      await expect(service.update(id, {} as any, user)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should throw NotFoundException when review not found', async () => {
      const id = '2d931510-d99f-494a-8c67-87feb05e1594';
      reviewRepo.findOne.mockResolvedValue(null as any);
      await expect(service.update(id, {} as any, user)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove own review', async () => {
      const id = '2d931510-d99f-494a-8c67-87feb05e1594';
      const review = { id, user: { id: user.id } } as any;
      reviewRepo.findOne.mockResolvedValue(review);
      reviewRepo.remove.mockResolvedValue(review);
      const result = await service.remove(id, user);
      expect(result).toEqual({ message: 'Review deleted successfully' });
    });

    it('should reject deleting others reviews', async () => {
      const id = '2d931510-d99f-494a-8c67-87feb05e1594';
      reviewRepo.findOne.mockResolvedValue({ id, user: { id: 'other' } } as any);
      await expect(service.remove(id, user)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should throw NotFoundException when review not found', async () => {
      const id = '2d931510-d99f-494a-8c67-87feb05e1594';
      reviewRepo.findOne.mockResolvedValue(null as any);
      await expect(service.remove(id, user)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getMovieReviews', () => {
    it('should validate movie id format', async () => {
      await expect(service.getMovieReviews('bad-id')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should return sanitized list', async () => {
      const movieId = '2d931510-d99f-494a-8c67-87feb05e1594';
      const movie = { id: movieId, reviews: [{ id: 'r1', user: { id: 'u1', password: 'x' } }] } as any;
      movieRepo.findOne.mockResolvedValue(movie);
      const result = await service.getMovieReviews(movieId);
      expect(result[0].user.password).toBeUndefined();
    });

    it('should throw when movie not found', async () => {
      const movieId = '2d931510-d99f-494a-8c67-87feb05e1594';
      movieRepo.findOne.mockResolvedValue(null as any);
      await expect(service.getMovieReviews(movieId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getUserReviews', () => {
    it('should validate user id format', async () => {
      await expect(service.getUserReviews('bad-id')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should return sanitized list', async () => {
      const userId = '2d931510-d99f-494a-8c67-87feb05e1594';
      const reviews = [
        { id: 'r1', user: { id: userId, password: 'x' }, movie: { id: 'm1', reviews: [{}] } } as any,
      ];
      reviewRepo.find.mockResolvedValue(reviews as any);
      const result = await service.getUserReviews(userId);
      expect(result[0].user.password).toBeUndefined();
      expect((result[0].movie as any).reviews).toBeUndefined();
    });

    it('should return empty array when no reviews', async () => {
      const userId = '2d931510-d99f-494a-8c67-87feb05e1594';
      reviewRepo.find.mockResolvedValue([]);
      const result = await service.getUserReviews(userId);
      expect(result).toEqual([]);
    });
  });

  describe('getMovieReviews - empty reviews', () => {
    it('should return empty array when movie has no reviews', async () => {
      const movieId = '2d931510-d99f-494a-8c67-87feb05e1594';
      const movie = { id: movieId, reviews: [] } as any;
      movieRepo.findOne.mockResolvedValue(movie);
      const result = await service.getMovieReviews(movieId);
      expect(result).toEqual([]);
    });

    it('should return empty array when movie.reviews is null', async () => {
      const movieId = '2d931510-d99f-494a-8c67-87feb05e1594';
      const movie = { id: movieId, reviews: null } as any;
      movieRepo.findOne.mockResolvedValue(movie);
      const result = await service.getMovieReviews(movieId);
      expect(result).toEqual([]);
    });
  });
});
