import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Jwt } from 'src/interfaces/jwt.interface';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { UserRole } from './enums/roles.enum';


@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {}

    async create(createUserDto: CreateUserDto) {

        const { password, ...userData } = createUserDto;

        try {

        const user = this.userRepository.create({
            ...userData,
            password: this.encryptPassword(password),
            roles: [UserRole.USER],
        });

        await this.userRepository.save(user);

        delete user.password;

        return {
            ...user,
            token: this.getJwtToken({id: user.id, email: user.email})
        };

        } catch (error) {
        this.handleException(error);
        }

        
        
    }

    async login(loginDto: LoginUserDto) {

        const { email, password } = loginDto;
    
        const user = await this.userRepository.findOne({ where: { email }, select: { email: true, password: true, id: true } });
    
        if (!user) throw new NotFoundException(`User with email ${email} not found`);
    
        if (!bcrypt.compareSync(password, user.password!)) {
          throw new NotFoundException('Invalid credentials');
        }
        delete user.password;
        return {
          ...user,
          token: this.getJwtToken({id: user.id, email: user.email})
        };
      }

    private getJwtToken(payload: Jwt){  
    
        const token = this.jwtService.sign(payload);
    
        return token;
      }
      
    
      private handleException(error) {
        if (error.code === '23505') {
          throw new InternalServerErrorException(error.detail);
        }
      }

    encryptPassword(password) {
        return bcrypt.hashSync(password, 10);
    }
}
