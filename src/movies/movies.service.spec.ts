import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { NotFoundException } from '@nestjs/common';

describe('MoviesService', () => {
  let service: MoviesService;
  let repo: jest.Mocked<Repository<Movie>>;

  beforeEach(async () => {
    const repoMock: Partial<Record<keyof Repository<Movie>, jest.Mock>> = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      preload: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: repoMock,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    repo = module.get(getRepositoryToken(Movie));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a movie with parsed releaseDate', async () => {
      const dto = {
        title: 'Matrix',
        description: 'desc',
        director: 'Wachowski',
        genre: 'sci-fi',
        releaseDate: '1999-03-31',
      } as any;

      const created: Partial<Movie> = { id: '1', ...dto, releaseDate: new Date(dto.releaseDate) };

      repo.create.mockReturnValue(created as Movie);
      repo.save.mockResolvedValue(created as Movie);

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith({
        title: dto.title,
        description: dto.description,
        director: dto.director,
        releaseDate: new Date(dto.releaseDate),
        genre: dto.genre,
      });
      expect(repo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('should return all movies', async () => {
      const movies = [{ id: '1' } as Movie, { id: '2' } as Movie];
      repo.find.mockResolvedValue(movies);
      await expect(service.findAll()).resolves.toEqual(movies);
    });
  });

  describe('findOne', () => {
    it('should return a movie by id', async () => {
      const movie = { id: 'abc' } as Movie;
      repo.findOne.mockResolvedValue(movie);
      await expect(service.findOne('abc')).resolves.toBe(movie);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'abc' } });
    });

    it('should throw NotFoundException when movie not found', async () => {
      repo.findOne.mockResolvedValue(null as any);
      await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('should preload, save and return updated movie, parsing date', async () => {
      const dto = { title: 'New', releaseDate: '2000-01-01' } as any;
      const preloaded = { id: '1', title: 'New', releaseDate: new Date(dto.releaseDate) } as Movie;
      repo.preload.mockResolvedValue(preloaded);
      repo.save.mockResolvedValue(preloaded);

      const result = await service.update('1', dto);

      expect(repo.preload).toHaveBeenCalledWith({ id: '1', ...dto, releaseDate: new Date(dto.releaseDate) });
      expect(repo.save).toHaveBeenCalledWith(preloaded);
      expect(result).toBe(preloaded);
    });

    it('should throw NotFoundException if preload returns null', async () => {
      repo.preload.mockResolvedValue(null as any);
      await expect(service.update('nope', { title: 'x' } as any)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove existing movie', async () => {
      const movie = { id: '1' } as Movie;
      repo.findOne.mockResolvedValue(movie);
      repo.remove.mockResolvedValue(movie);

      await expect(service.remove('1')).resolves.toEqual({ message: 'Movie deleted', id: '1' });
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(repo.remove).toHaveBeenCalledWith(movie);
    });

    it('should throw NotFoundException when movie not found', async () => {
      repo.findOne.mockResolvedValue(null as any);
      await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
