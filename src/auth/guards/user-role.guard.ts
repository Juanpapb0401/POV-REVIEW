import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { META_ROLES } from '../decorators/role-protected/role-protected.decorator';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    //reflector obtener info que esta tratando
    //si paso un rol por el decorador, como que yo lo puedo comparar en canActivate
    private readonly reflector: Reflector,
  ){}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validRoles: string [] = this.reflector.get(META_ROLES, context.getHandler());

    if(!validRoles) return true;

    if(validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();


    const user = req.user as User;

    if(!user) throw new BadRequestException('User not found');

    const hasValidRole = user.roles.some((role) => validRoles.includes(role));

    if(hasValidRole) return true;

    throw new ForbiddenException(`User with id ${user.email} needs a valid roles`);

  }
}
