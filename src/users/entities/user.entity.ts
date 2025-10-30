import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, BeforeUpdate, BeforeInsert, OneToMany } from "typeorm";
import { IsEmail } from "class-validator";
import { UserRole } from "../../auth/enums/roles.enum";
import { Review } from "src/reviews/entities/review.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
@Entity('users')
export class User {

  @ApiProperty({
    example: '38c8f3fe-zzzz-xxxx-81ff-77fe9846f1dd',
    description: 'User  id',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Daniel Gonzalez',
    description: 'User name',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'daniel@gmail.com',
    description: 'User email',
    uniqueItems: true,
  })
  @Column({
    unique: true,
    type: 'text'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Abc123456',
    description: 'User password (encrypted)',
    writeOnly: true,
    minLength: 6,
  })
  @Column({
    type: 'text'
  })
  password?: string; // en el  repo del profe es opcional, pero no puede ser

  @ApiProperty({
    example: ['user'],
    description: 'User roles',
    enum: UserRole,
    isArray: true,
    default: [UserRole.USER],
  })
  @Column({
    type: 'text',
    array: true,
    default: [UserRole.USER]
  })
  roles: string[];

  @ApiPropertyOptional({
    description: 'User reviews',
    type: () => Review,
    isArray: true,
  })
  @OneToMany(() => Review, (review) => review.user, { cascade: true })
  reviews?: Review[];

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'User creation date',
    type: Date,
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'User last update date',
    type: Date,
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    example: true,
    description: 'User active status',
    default: true,
  })
  @Column('boolean', { default: true })
  isActive: boolean;

  @BeforeUpdate()
  @BeforeInsert()
  checkFieldsBeforeChanges() {
    this.email = this.email.toLowerCase().trim();
  }
}
