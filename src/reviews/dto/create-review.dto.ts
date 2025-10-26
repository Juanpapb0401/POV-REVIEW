import { IsArray, IsIn, IsOptional, IsString } from "class-validator";
import { Review } from "../entities/review.entity";

export class CreateReviewDto {

    @IsString()
    title: string;
    
    @IsString()
    description: string;
    
    @IsString()
    director: string;
    
    @IsString()
    releaseDate: Date;
    
    @IsString()
    @IsIn(['action', 'comedy', 'drama', 'horror', 'romance', 'sci-fi', 'thriller']) // hay que especificar
    genre: string;

    @IsArray()
    @IsOptional()
    reviews?: Review[];
    
}
