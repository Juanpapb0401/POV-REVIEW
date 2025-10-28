import { IsString, IsNumber, Min, Max, IsUUID } from "class-validator";

export class CreateReviewDto {
    @IsString()
    name: string;

    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @IsString()
    comment: string;

    @IsUUID()
    movieId: string;
}
