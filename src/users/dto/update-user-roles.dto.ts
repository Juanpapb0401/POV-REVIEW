import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../auth/enums/roles.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRolesDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles: UserRole[];
}
