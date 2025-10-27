import {IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength} from "class-validator"
import { UserRole } from "../../auth/enums/roles.enum";

export class CreateUserDto {

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
