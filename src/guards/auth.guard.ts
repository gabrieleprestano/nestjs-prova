import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * Types
 */
import type { Request } from 'express';
import type { JwtPayload } from '../models/types/jwt-payload.type.js';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = request.cookies?.['access_token'];
    if (!token) throw new UnauthorizedException('You are not authenticated. Access token is missing.');

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      request.user = payload;
    } catch {
      throw new UnauthorizedException('Access token not valid or expired.');
    }
    return true;
  }
}
