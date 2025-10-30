import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDateString, IsIn, IsOptional, IsString } from "class-validator";
import { Review } from "src/reviews/entities/review.entity";

export class CreateMovieDto {

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  director: string;

  @ApiProperty()
  @IsDateString()
  releaseDate: string;

  @ApiProperty()
  @IsString()
  @IsIn(['action', 'comedy', 'drama', 'horror', 'romance', 'sci-fi', 'thriller'])
  genre: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  reviews?: Review[];

}
