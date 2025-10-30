import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../auth/enums/roles.enum';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @Auth()
  create(@Body() createReviewDto: CreateReviewDto, @GetUser() user: User) {
    return this.reviewsService.create(createReviewDto, user);
  }

  @Post('movie/:movieId')
  @Auth()
  createForMovie(@Param('movieId') movieId: string, @Body() createReviewDto: CreateReviewDto, @GetUser() user: User,) {
    createReviewDto.movieId = movieId;
    return this.reviewsService.create(createReviewDto, user);
  }

  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get('movie/:movieId')
  getMovieReviews(@Param('movieId') movieId: string) {
    return this.reviewsService.getMovieReviews(movieId);
  }

  @Get('user/:userId')
  getUserReviews(@Param('userId') userId: string) {
    return this.reviewsService.getUserReviews(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto, @GetUser() user: User) {
    return this.reviewsService.update(id, updateReviewDto, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.reviewsService.remove(id, user);
  }
}

