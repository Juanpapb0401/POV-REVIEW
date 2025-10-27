import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../auth/enums/roles.enum';

export class UpdateUserRolesDto {
  @IsNotEmpty()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles: UserRole[];
}
