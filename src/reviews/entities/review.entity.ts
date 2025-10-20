import { Movie } from "src/movies/entities/movie.entity";
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, ManyToOne } from "typeorm";

@Entity('reviews')
export class Review {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    rating: number;

    @Column()
    comment: string;

    @ManyToOne(()=> Movie, (movie) => movie.reviews, {onDelete: 'CASCADE'})
    movie: Movie;

    @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
    
}
