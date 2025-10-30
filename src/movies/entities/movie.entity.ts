import { Review } from "src/reviews/entities/review.entity";
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, OneToMany } from "typeorm";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

@Entity('movies')
export class Movie {

    @ApiProperty({
        example: '38c8f3fe-zzzz-xxxx-81ff-77fe9846f1dd',
        description: 'Movie id',
        uniqueItems: true,
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'The Matrix',
        description: 'Movie title',
    })
    @Column('text')
    title: string;

    @ApiProperty({
        example: 'A computer hacker learns about the true nature of reality and his role in the war against its controllers.',
        description: 'Movie description',
    })
    @Column('text')
    description: string;

    @ApiProperty({
        example: 'Lana Wachowski, Lilly Wachowski',
        description: 'Movie director(s)',
    })
    @Column('text')
    director: string;

    @ApiProperty({
        example: '1999-03-31',
        description: 'Movie release date',
        type: Date,
    })
    @Column('date')
    releaseDate: Date;

    @ApiProperty({
        example: 'sci-fi',
        description: 'Movie genre',
    })
    @Column('text')
    genre: string;

    @ApiPropertyOptional({
        description: 'Movie reviews',
        type: () => Review,
        isArray: true,
    })
    @OneToMany(() => Review, (review) => review.movie, {cascade: true, eager: true})
    reviews?: Review[];

    @ApiProperty({
        example: '2024-01-15T10:30:00.000Z',
        description: 'Movie creation date',
        type: Date,
    })
    @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @ApiProperty({
        example: '2024-01-15T10:30:00.000Z',
        description: 'Movie last update date',
        type: Date,
    })
    @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
}
