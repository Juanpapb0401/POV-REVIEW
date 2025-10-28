import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../auth/guards/user-role.guard';
import { RoleProtected } from '../auth/decorators/role-protected/role-protected.decorator';
import { UserRole } from '../auth/enums/roles.enum';
import { PaginationDto } from './dto/pagination.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Auth(UserRole.ADMIN)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get('profile')
  @Auth() 
  userProfile(@GetUser() user: User) {
    return this.usersService.userProfile(user.id);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string) {
    return this.usersService.findOneWithReviews(term);
  }

  @Auth(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // Endpoint de administración para cambiar roles
  @Patch(':id/roles')
  @UseGuards(AuthGuard(), UserRoleGuard)
  @RoleProtected(UserRole.ADMIN)
  updateUserRoles(
    @Param('id') userId: string,
    @Body() updateUserRolesDto: UpdateUserRolesDto
  ) {
    return this.usersService.updateUserRoles(userId, updateUserRolesDto);
  }
}
