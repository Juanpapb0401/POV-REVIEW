import { Injectable } from '@nestjs/common';
import { MoviesService } from 'src/movies/movies.service';
import { ReviewsService } from 'src/reviews/reviews.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class SeedService {

    constructor(private readonly usersService: UsersService,
                private readonly moviesService: MoviesService,
                private readonly reviewsService: ReviewsService,
    ) {}

    async runSeed() {
        await this.insertNewUsers();
        await this.insertNewMovies();
        await this.insertNewReviews();
        return 'Seed executed successfully';
    }

    async insertNewUsers() {
        await this.usersService.deleteAllUsers();
        //const users = initialData.users;

        const insertPromises : Promise<User | undefined>[] = [];

        //users.forEach(user => {
        //    insertPromises.push(this.usersService.create(user));
        //});

        await Promise.all(insertPromises); //necesito controlar una promesa por si falla
        // allSettled : espera a que todas las promesas se resuelvan
        // race : espera a que una promesa se resuelva
        // resolve: resuelve una promosa como tal
        return true;
    }

    async insertNewMovies() {
        //const movies = [];
        //return movies;
    }

    async insertNewReviews() {
        //const reviews = [];
        //return reviews;
    }
}
