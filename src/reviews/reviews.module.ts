import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Movie } from 'src/movies/entities/movie.entity';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
  imports: [
    TypeOrmModule.forFeature([Review, Movie]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule
  ],
})
export class ReviewsModule { }
