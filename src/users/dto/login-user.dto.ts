import { IsString, IsEmail, IsNotEmpty } from "class-validator";

export class LoginUserDto {

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}