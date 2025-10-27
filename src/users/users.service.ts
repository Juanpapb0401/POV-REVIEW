import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from './dto/pagination.dto';
import { isUUID } from 'class-validator';

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
      await this.userRepository.save(user);
      return user

    } catch (error) {
      this.handleException(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    try {
      const {limit, offset} = paginationDto
      return this.userRepository.find({
        take:limit,
        skip:offset
      })
      
    } catch (error) {
      this.handleException(error)
    }

  }

  async findOne(term: string) {
    let user: User | null;

    if(isUUID(term)){
      user = await this.userRepository.findOne({
        where: { id: term },
        relations: ['reviews', 'reviews.movie']
      });
    }else{
      const queryBuilder = this.userRepository.createQueryBuilder('user');
      user = await queryBuilder
        .where('user.email = :email', { email: term })
        .leftJoinAndSelect('user.reviews', 'reviews')
        .leftJoinAndSelect('reviews.movie', 'movie')
        .getOne();
    }
    if(!user) throw new NotFoundException(`User with term ${term} not found`);
    return user;
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

