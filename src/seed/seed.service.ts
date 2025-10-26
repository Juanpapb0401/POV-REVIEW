import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { Movie } from '../movies/entities/movie.entity';
import { Review } from '../reviews/entities/review.entity';
import { seedUsers } from './data/seed.users.data';
import { seedMovies } from './data/seed.movies.data';
import { seedReviews } from './data/seed.reviews.data';

@Injectable()
export class SeedService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Movie)
		private readonly movieRepository: Repository<Movie>,
		@InjectRepository(Review)
		private readonly reviewRepository: Repository<Review>,
	) {}

	async runSeed() {
		const createdUsers: any[] = [];
		const createdMovies: any[] = [];
		const createdReviews: any[] = [];

		// Users: insert if not exists (with bcrypt hashing)
		for (const u of seedUsers) {
			const existing = await this.userRepository.findOneBy({ email: u.email });
			if (existing) {
				createdUsers.push({ id: existing.id, email: existing.email, name: existing.name, status: 'already-exists' });
				continue;
			}
			
			const passwordHash = u.password ? await bcrypt.hash(u.password, 10) : undefined;
			const user = this.userRepository.create({ ...u, password: passwordHash } as any);
			const saved = (await this.userRepository.save(user)) as unknown as User;
			createdUsers.push({ id: saved.id, email: saved.email, name: saved.name, status: 'created' });
		}

		// Movies: insert if not exists
		for (const m of seedMovies) {
			const existing = await this.movieRepository.findOneBy({ title: (m as any).title });
			if (existing) {
				createdMovies.push({ id: existing.id, title: (existing as any).title, status: 'already-exists' });
				continue;
			}
			const movie = this.movieRepository.create(m as any);
			const saved = (await this.movieRepository.save(movie)) as unknown as Movie;
			createdMovies.push({ id: saved.id, title: (saved as any).title, status: 'created' });
		}

		// Reviews: link to movie by title
		for (const r of seedReviews) {
			const movie = await this.movieRepository.findOneBy({ title: r.movieTitle as any });
			if (!movie) {
				console.warn(`Movie not found for review: ${r.movieTitle}`);
				continue;
			}
			
			const existing = await this.reviewRepository.findOneBy({ comment: r.comment, name: r.name });
			if (existing) {
				createdReviews.push({ id: existing.id, name: existing.name, status: 'already-exists' });
				continue;
			}
			
			const review = this.reviewRepository.create({
				name: r.name,
				rating: r.rating,
				comment: r.comment,
				movie: movie,
			} as any);
			const saved = (await this.reviewRepository.save(review)) as unknown as Review;
			createdReviews.push({ id: saved.id, name: saved.name, movieId: movie.id, status: 'created' });
		}

		return {
			ok: true,
			message: 'Seed execution completed',
			usersCreated: createdUsers,
			moviesCreated: createdMovies,
			reviewsCreated: createdReviews,
		};
	}
}
