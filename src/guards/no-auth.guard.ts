import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

/**
 * JWT Service
 */
import { JwtService } from '@nestjs/jwt';

/**
 * Types
 */
import type { Request } from 'express';

@Injectable()
export class NoAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.['access_token'];

    // If the token exists, it verifies it to check if the user is already logged in.
    if (token) {
      try {
        await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET,
        });

        // If the verification is successful, the user is already logged in
        throw new BadRequestException('You are already logged in.');
      } catch (error) {
        // If it is the exception thrown by us, re-throw it
        if (error instanceof BadRequestException) throw error;
      }
    }

    // If the token verification fails (invalid or expired token), allow to proceed
    return true;
  }
}