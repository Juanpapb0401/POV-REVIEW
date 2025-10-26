import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { UsersModule } from 'src/users/users.module';
import { MoviesModule } from 'src/movies/movies.module';
import { ReviewsModule } from 'src/reviews/reviews.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [UsersModule, MoviesModule, ReviewsModule],
})
export class SeedModule {}
