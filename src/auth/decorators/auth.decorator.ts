import { applyDecorators, UseGuards } from "@nestjs/common";
import { UserRole } from "../enums/roles.enum";
import { AuthGuard } from "@nestjs/passport";
import { RoleProtected } from "./role-protected/role-protected.decorator";
import { UserRoleGuard } from "../guards/user-role.guard";


export function Auth(...roles: UserRole[]) {
    return applyDecorators(
        RoleProtected(...roles),
        UseGuards(AuthGuard(), UserRoleGuard)
    )
}