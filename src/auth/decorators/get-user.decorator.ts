import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const GetUser = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new InternalServerErrorException('User not found in request');
        }

        // Si se especifica un campo, devolver solo ese campo
        return data ? user[data] : user;
    },
);
