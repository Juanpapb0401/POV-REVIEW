import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
import { Movie } from '../movies/entities/movie.entity';
import { User } from '../users/entities/user.entity';
import { isUUID } from 'class-validator';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger('ReviewsService');

  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async create(createReviewDto: CreateReviewDto, user: User) {
    try {
      const movie = await this.movieRepository.findOneBy({ id: createReviewDto.movieId });
      if (!movie) {
        throw new NotFoundException(`Movie with ID ${createReviewDto.movieId} not found`);
      }

      const existingReview = await this.reviewRepository.findOne({
        where: {
          movie: { id: movie.id },
          user: { id: user.id }
        }
      });

      if (existingReview) {
        throw new BadRequestException('User has already reviewed this movie');
      }

      const review = this.reviewRepository.create({
        ...createReviewDto,
        movie,
        user,
      });

      const saved = await this.reviewRepository.save(review);

      // Load saved review with relations to return a complete object
      const result = await this.reviewRepository.findOne({
        where: { id: (saved as any).id },
        relations: ['movie', 'user'],
      });

      // sanitize
      if (result && result.user) delete (result.user as any).password;
      if (result && result.movie) (result.movie as any).reviews = undefined;

      return result;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async findAll() {
    const reviews = await this.reviewRepository.find({
      relations: ['movie', 'user'],
    });

    return reviews.map(r => {
      if (r.user) delete (r.user as any).password;
      if (r.movie) (r.movie as any).reviews = undefined;
      return r;
    });
  }

  async findOne(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['movie', 'user'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    if (review.user) delete (review.user as any).password;
    if (review.movie) (review.movie as any).reviews = undefined;

    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, user: User) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    if (review.user.id !== user.id) {
      throw new BadRequestException('You can only update your own reviews');
    }

    Object.assign(review, updateReviewDto);
    const saved = await this.reviewRepository.save(review);

    const result = await this.reviewRepository.findOne({
      where: { id: (saved as any).id },
      relations: ['movie', 'user'],
    });

    if (result && result.user) delete (result.user as any).password;
    if (result && result.movie) (result.movie as any).reviews = undefined;

    return result;
  }

  async remove(id: string, user: User) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    if (review.user.id !== user.id) {
      throw new BadRequestException('You can only delete your own reviews');
    }

    await this.reviewRepository.remove(review);
    return { message: 'Review deleted successfully' };
  }

  async getMovieReviews(movieId: string) {
    if (!isUUID(movieId)) {
      throw new BadRequestException('Invalid movie ID format');
    }

    const movie = await this.movieRepository.findOne({
      where: { id: movieId },
      relations: ['reviews', 'reviews.user'],
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }

    if (movie.reviews && movie.reviews.length) {
      movie.reviews = movie.reviews.map(r => {
        if ((r as any).user) delete ((r as any).user as any).password;
        return r;
      });
    } else {
      movie.reviews = [];
    }

    return movie.reviews;
  }

  async getUserReviews(userId: string) {
    if (!isUUID(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const reviews = await this.reviewRepository.find({
      where: { user: { id: userId } },
      relations: ['movie', 'user'],
    });

    return reviews.map(r => {
      if (r.user) delete (r.user as any).password;
      if (r.movie) (r.movie as any).reviews = undefined;
      return r;
    });
  }
}