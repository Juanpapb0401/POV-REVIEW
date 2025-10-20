import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, Unique, BeforeUpdate, BeforeInsert } from "typeorm";
import { IsEmail } from "class-validator";

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

    @Column({
        unique: true,
        type: 'text'
    })
    @IsEmail()
    email: string;

    @Column({
        type: 'text'
    })
    password: string; // en el  repo del profe es opcional, pero no puede ser

    @Column({ type: 'enum', enum: UserRole})
    role: UserRole;

    @CreateDateColumn() 
    createdAt: Date;
    
    @UpdateDateColumn() 
    updatedAt: Date;

    @Column('boolean', {default: true})
    isActive: boolean;

    @BeforeUpdate()
    @BeforeInsert()
    checkFieldsBeforeChanges(){
        this.email = this.email.toLowerCase().trim();
    }
}
