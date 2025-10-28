import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, BeforeUpdate, BeforeInsert, OneToMany } from "typeorm";
import { IsEmail } from "class-validator";
import { UserRole } from "../../auth/enums/roles.enum";
import { Review } from "src/reviews/entities/review.entity";
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
    password?: string; // en el  repo del profe es opcional, pero no puede ser

    @Column({
        type:'text',
        array:true,
        default: [UserRole.USER]
    })
    roles:string[];

    @OneToMany(() => Review, (review) => review.user, {cascade: true})
    reviews?: Review[];

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
