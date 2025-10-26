import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, BeforeUpdate, BeforeInsert } from "typeorm";
import { IsEmail } from "class-validator";
import { UserRole } from "../../auth/enums/roles.enum";
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
