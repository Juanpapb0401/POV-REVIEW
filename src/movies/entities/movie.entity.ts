import { Review } from "src/reviews/entities/review.entity";
import { PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, OneToMany } from "typeorm";

export class Movie {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    tittle: string;

    @Column('text')
    description: string;

    @Column('text')
    director: string;

    @Column('date')
    releaseDate: Date;

    @Column('text')
    genre: string;

    @OneToMany(() => Review, (review) => review.movie, {cascade: true, eager: true})
    reviews?: Review[];

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
