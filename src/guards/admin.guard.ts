import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { AuthenticatedRequest } from "./auth.guard.js";

@Injectable()
export class AdminGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        const user = request.user;

        if (!user || user.role !== 'admin') {
            throw new ForbiddenException('Access denied. Admins only.');
        }

        return true;
    }
}