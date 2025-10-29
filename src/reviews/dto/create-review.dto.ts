import { IsString, IsNumber, Min, Max, IsUUID, IsOptional } from "class-validator";

export class CreateReviewDto {
    @IsString()
    name: string;

    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @IsString()
    comment: string;

    // movieId can be provided in the body or injected from the URL by the controller
    @IsUUID()
    @IsOptional()
    movieId?: string;
}
