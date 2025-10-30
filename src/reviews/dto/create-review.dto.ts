import { IsString, IsNumber, Min, Max, IsUUID, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

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

    @IsUUID()
    @IsOptional()
    movieId: string;
}
