import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
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

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({ summary: 'Register a user' })
  @ApiResponse({ status: 201, description: 'User created', type: User })
  @ApiResponse({ status: 400, description: 'Bad Request'})
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Auth(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List users with pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'Array of users', type: [User] })
  @ApiResponse({ status: 400, description: 'Bad Request'})
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get('profile')
  @Auth() 
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile', type: User })
  @ApiResponse({ status: 400, description: 'Bad Request'})
  userProfile(@GetUser() user: User) {
    return this.usersService.userProfile(user.id);
  }

  @Get(':term')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Find a user by id or email' }) //ASK: este cual con que consulta, si con el id o con el email?
  @ApiParam({ name: 'term', description: 'User id (uuid) or email' })
  @ApiResponse({ status: 200, description: 'User with reviews', type: User })
  @ApiResponse({ status: 400, description: 'Bad Request'})
  findOne(@Param('term') term: string) {
    return this.usersService.findOneWithReviews(term);
  }

  @Auth(UserRole.ADMIN)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User id (uuid)' })
  @ApiResponse({ status: 200, description: 'User updated', type: User })
  @ApiResponse({ status: 400, description: 'Bad Request'})
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User id (uuid)' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request'})
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // Endpoint de administración para cambiar roles
  @Patch(':id/roles')
  @UseGuards(AuthGuard(), UserRoleGuard)
  @RoleProtected(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user roles (admin only)' })
  @ApiParam({ name: 'id', description: 'User id (uuid)' })
  @ApiResponse({ status: 200, description: 'User roles updated', type: User })
  @ApiResponse({ status: 400, description: 'Bad Request'})
  updateUserRoles(
    @Param('id') userId: string,
    @Body() updateUserRolesDto: UpdateUserRolesDto
  ) {
    return this.usersService.updateUserRoles(userId, updateUserRolesDto);
  }
}
