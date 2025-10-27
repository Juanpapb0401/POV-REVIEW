import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../auth/guards/user-role.guard';
import { RoleProtected } from '../auth/decorators/role-protected/role-protected.decorator';
import { UserRole } from '../auth/enums/roles.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
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
