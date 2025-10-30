import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, Min, Max, IsUUID } from "class-validator";

export class CreateReviewDto {

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty()
  @IsString()
  comment: string;

  @ApiProperty()
  @IsUUID()
  movieId: string;
}
