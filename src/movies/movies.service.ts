import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    const { title, description, director, genre } = createMovieDto;
    const releaseDate = new Date(createMovieDto.releaseDate);

    const movie = this.movieRepository.create({
      title,
      description,
      director,
      releaseDate,
      genre,
    });

    return await this.movieRepository.save(movie);
  }

  async findAll(): Promise<Movie[]> {
    return await this.movieRepository.find();
  }

  async findOne(id: string): Promise<Movie> {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }
    return movie;
  }

  async update(id: string, updateMovieDto: UpdateMovieDto): Promise<Movie> {
    const preloadData: Partial<Movie> = { id, ...updateMovieDto } as Partial<Movie>;
    if (updateMovieDto.releaseDate) {
      (preloadData as any).releaseDate = new Date(updateMovieDto.releaseDate);
    }

    const movie = await this.movieRepository.preload(preloadData);
    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }
    return await this.movieRepository.save(movie);
  }

  async remove(id: string): Promise<{ message: string; id: string }> {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }
    await this.movieRepository.remove(movie);
    return { message: 'Movie deleted', id };
  }
}