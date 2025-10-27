import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  private logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly dataSource: DataSource,
  ) {}


  async create(createUserDto: CreateUserDto){
    try {
      const user = this.userRepository.create(createUserDto);
      return this.userRepository.save(user);

    } catch (error) {
      this.handleException(error);
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async updateUserRoles(userId: string, updateUserRolesDto: UpdateUserRolesDto) {
    try {
      // Verificar que el usuario existe
      const user = await this.userRepository.findOne({ where: { id: userId } });
      
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Actualizar los roles
      user.roles = updateUserRolesDto.roles;
      
      const updatedUser = await this.userRepository.save(user);
      
      // Remover password de la respuesta
      delete updatedUser.password;
      
      return {
        message: 'User roles updated successfully',
        user: updatedUser
      };

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
    }
  }

  async deleteAllUsers() {}

  private handleException(error){
    this.logger.error(error);
    if(error.code === '23505'){
      throw new InternalServerErrorException(error.detail);
    }
  }
}

