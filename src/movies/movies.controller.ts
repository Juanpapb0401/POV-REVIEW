import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserRole } from 'src/auth/enums/roles.enum';
import { Movie } from './entities/movie.entity';

@ApiTags('Movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @Auth(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a movie' })
  @ApiResponse({ status: 201, description: 'Movie created', type: Movie })
   @ApiResponse({ status: 400, description: 'Bad Request'})
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all movies' })
  @ApiResponse({ status: 200, description: 'Array of movies', type: [Movie] })
  @ApiResponse({ status: 400, description: 'Bad Request'})
  findAll() {
    return this.moviesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get movie by id' })
  @ApiParam({ name: 'id', description: 'Movie id (uuid)' })
  @ApiResponse({ status: 200, description: 'Movie found', type: Movie })
  @ApiResponse({ status: 400, description: 'Bad Request'})
  findOne(@Param('id') id: string) {
    return this.moviesService.findOne(id);
  }

  @Patch(':id')
  @Auth(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a movie' })
  @ApiParam({ name: 'id', description: 'Movie id (uuid)' })
  @ApiResponse({ status: 200, description: 'Movie updated', type: Movie })
  @ApiResponse({ status: 400, description: 'Bad Request'})
  update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.moviesService.update(id, updateMovieDto);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a movie' })
  @ApiParam({ name: 'id', description: 'Movie id (uuid)' })
  @ApiResponse({ status: 200, description: 'Movie deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request'})
  remove(@Param('id') id: string) {
    return this.moviesService.remove(id);
  }
}