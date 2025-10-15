import {IsEmail, IsEnum, IsNotEmpty, IsString, MinLength} from "class-validator"
import { UserRole } from "../entities/user.entity";

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

  @IsEnum(UserRole)
  role: UserRole;
}
