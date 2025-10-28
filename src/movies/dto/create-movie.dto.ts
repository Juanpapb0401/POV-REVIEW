import { IsArray, IsDateString, IsIn, IsOptional, IsString } from "class-validator";
import { Review } from "src/reviews/entities/review.entity";

export class CreateMovieDto {

  @IsString()
  title: string;
  
  @IsString()
  description: string;
  
  @IsString()
  director: string;
  
  @IsDateString()
  releaseDate: string;
  
  @IsString()
  @IsIn(['action', 'comedy', 'drama', 'horror', 'romance', 'sci-fi', 'thriller'])
  genre: string;

  @IsArray()
  @IsOptional()
  reviews?: Review[];
  
}