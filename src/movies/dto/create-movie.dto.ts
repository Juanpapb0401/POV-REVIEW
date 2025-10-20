import { IsArray, IsIn, IsOptional, IsString } from "class-validator";
import { Review } from "src/reviews/entities/review.entity";

export class CreateMovieDto {

    @IsString()
    tittle: string;
    
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
