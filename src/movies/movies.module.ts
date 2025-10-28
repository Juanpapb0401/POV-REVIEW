import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [MoviesService],
  imports: [TypeOrmModule.forFeature([Movie]), AuthModule],
})
export class MoviesModule {}
