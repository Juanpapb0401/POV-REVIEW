import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../auth/enums/roles.enum';
import { Review } from './entities/review.entity';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @Post()
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a review' })
  @ApiResponse({ status: 201, description: 'Review created', type: Review })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createReviewDto: CreateReviewDto, @GetUser() user: User) {
    return this.reviewsService.create(createReviewDto, user);
  }

  //TODO:  Agregarle swagger a esta ruta
  @ApiOperation({ summary: 'Create a review for a movie' })
  @ApiParam({ name: 'movieId', description: 'Movie id (uuid)' })
  @ApiResponse({ status: 201, description: 'Review created', type: Review })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Post('movie/:movieId')
  @Auth()
  createForMovie(@Param('movieId') movieId: string, @Body() createReviewDto: CreateReviewDto, @GetUser() user: User,) {
    createReviewDto.movieId = movieId;
    return this.reviewsService.create(createReviewDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List all reviews' })
  @ApiResponse({ status: 200, description: 'Array of reviews', type: [Review] })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get('movie/:movieId')
  @ApiOperation({ summary: 'Get reviews by movie id' })
  @ApiParam({ name: 'movieId', description: 'Movie id (uuid)' })
  @ApiResponse({ status: 200, description: 'Array of reviews', type: [Review] })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  getMovieReviews(@Param('movieId') movieId: string) {
    return this.reviewsService.getMovieReviews(movieId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get reviews by user id' })
  @ApiParam({ name: 'userId', description: 'User id (uuid)' })
  @ApiResponse({ status: 200, description: 'Array of reviews', type: [Review] })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  getUserReviews(@Param('userId') userId: string) {
    return this.reviewsService.getUserReviews(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by id' })
  @ApiParam({ name: 'id', description: 'Review id (uuid)' })
  @ApiResponse({ status: 200, description: 'Review found', type: Review })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a review' })
  @ApiParam({ name: 'id', description: 'Review id (uuid)' })
  @ApiResponse({ status: 200, description: 'Review updated', type: Review })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto, @GetUser() user: User) {
    return this.reviewsService.update(id, updateReviewDto, user);
  }

  @Delete(':id')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiParam({ name: 'id', description: 'Review id (uuid)' })
  @ApiResponse({ status: 200, description: 'Review deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.reviewsService.remove(id, user);
  }
}

