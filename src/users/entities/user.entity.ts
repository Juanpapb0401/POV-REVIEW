import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn } from "typeorm";


export enum UserRole {
    ADMIN = 'admin',
    USER = 'user'
}

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column({ type: 'enum', enum: UserRole})
    role: UserRole;

    @CreateDateColumn() 
    createdAt: Date;
    
    @UpdateDateColumn() 
    updatedAt: Date;
}
