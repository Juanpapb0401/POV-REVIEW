import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User } from '../users/entities/user.entity';
import { Movie } from '../movies/entities/movie.entity';
import { Review } from '../reviews/entities/review.entity';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [TypeOrmModule.forFeature([User, Movie, Review])],
})
export class SeedModule {}
