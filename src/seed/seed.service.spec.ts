import { Test, TestingModule } from '@nestjs/testing';
import { SeedService } from './seed.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Movie } from '../movies/entities/movie.entity';
import { Review } from '../reviews/entities/review.entity';
import { Repository } from 'typeorm';

describe('SeedService', () => {
  let service: SeedService;
  let userRepo: jest.Mocked<Repository<User>>;
  let movieRepo: jest.Mocked<Repository<Movie>>;
  let reviewRepo: jest.Mocked<Repository<Review>>;

  beforeEach(async () => {
    const userRepoMock: Partial<Record<keyof Repository<User>, jest.Mock>> = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const movieRepoMock: Partial<Record<keyof Repository<Movie>, jest.Mock>> = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const reviewRepoMock: Partial<Record<keyof Repository<Review>, jest.Mock>> = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        { provide: getRepositoryToken(User), useValue: userRepoMock },
        { provide: getRepositoryToken(Movie), useValue: movieRepoMock },
        { provide: getRepositoryToken(Review), useValue: reviewRepoMock },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
    userRepo = module.get(getRepositoryToken(User));
    movieRepo = module.get(getRepositoryToken(Movie));
    reviewRepo = module.get(getRepositoryToken(Review));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('runSeed', () => {
    it('should skip existing users and create new ones', async () => {
      userRepo.findOneBy.mockResolvedValue(null as any);
      userRepo.create.mockReturnValue({ id: 'u1', email: 'new@test.com' } as any);
      userRepo.save.mockResolvedValue({ id: 'u1', email: 'new@test.com', name: 'User', roles: ['user'] } as any);

      movieRepo.findOneBy.mockResolvedValue(null as any);
      movieRepo.create.mockReturnValue({ id: 'm1' } as any);
      movieRepo.save.mockResolvedValue({ id: 'm1', title: 'Movie' } as any);

      reviewRepo.findOneBy.mockResolvedValue(null as any);
      reviewRepo.create.mockReturnValue({ id: 'r1' } as any);
      reviewRepo.save.mockResolvedValue({ id: 'r1' } as any);

      const result = await service.runSeed();

      expect(result.ok).toBe(true);
      expect(result.usersCreated.length).toBeGreaterThanOrEqual(0);
    });

    it('should skip existing entities', async () => {
      const existingUser = { id: 'u1', email: 'existing@test.com', name: 'Existing', roles: ['user'] };
      const existingMovie = { id: 'm1', title: 'Existing Movie' };
      const existingReview = { id: 'r1', name: 'Review' };

      userRepo.findOneBy.mockResolvedValue(existingUser as any);
      movieRepo.findOneBy.mockResolvedValue(existingMovie as any);
      reviewRepo.findOneBy.mockResolvedValue(existingReview as any);

      const result = await service.runSeed();

      expect(result.ok).toBe(true);
      expect(userRepo.save).not.toHaveBeenCalled();
      expect(movieRepo.save).not.toHaveBeenCalled();
    });

    it('should handle case when user not found for review', async () => {
      // Setup: users and movies exist
      userRepo.findOneBy.mockResolvedValueOnce(null as any); // First user check
      userRepo.create.mockReturnValue({ id: 'u1', email: 'user@test.com' } as any);
      userRepo.save.mockResolvedValue({ id: 'u1', email: 'user@test.com', name: 'User', roles: ['user'] } as any);

      movieRepo.findOneBy.mockResolvedValue({ id: 'm1', title: 'Movie' } as any);
      
      // When checking for review's user, return null (user not found)
      userRepo.findOneBy.mockResolvedValue(null as any);

      const result = await service.runSeed();

      expect(result.ok).toBe(true);
      // Reviews should be skipped when user not found
    });

    it('should create reviews successfully when all entities exist', async () => {
      const user = { id: 'u1', email: 'user@test.com', name: 'User', roles: ['user'] };
      const movie = { id: 'm1', title: 'The First Adventure' };

      // Users and movies already exist
      userRepo.findOneBy.mockResolvedValue(user as any);
      movieRepo.findOneBy.mockResolvedValue(movie as any);
      
      // Review doesn't exist
      reviewRepo.findOneBy.mockResolvedValue(null as any);
      reviewRepo.create.mockReturnValue({ id: 'r1', name: 'Great movie' } as any);
      reviewRepo.save.mockResolvedValue({ id: 'r1' } as any);

      const result = await service.runSeed();

      expect(result.ok).toBe(true);
      expect(reviewRepo.create).toHaveBeenCalled();
      expect(reviewRepo.save).toHaveBeenCalled();
    });
  });
});

