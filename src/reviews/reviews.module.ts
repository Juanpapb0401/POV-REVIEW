import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Movie } from 'src/movies/entities/movie.entity';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
  imports: [TypeOrmModule.forFeature([Review, Movie])],
})
export class ReviewsModule {}
