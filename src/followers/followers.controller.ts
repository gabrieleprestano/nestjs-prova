import { Controller, Post, UseGuards, Request, Param } from '@nestjs/common';

/**
 * Services
 */
import { FollowersService } from './followers.service.js';

/**
 * Types
 */
import type { Request as ExpressRequest } from 'express';
import type { JwtPayload } from '../models/types/jwt-payload.type.js';

/**
 * Guards
 */
import { AuthGuard } from '../guards/auth.guard.js';

@Controller('followers')
export class FollowersController {
  constructor(private readonly followersService: FollowersService) { }

  @UseGuards(AuthGuard)
  @Post('/follow/:followingId')
  async toggleFollow(@Request() req: ExpressRequest & { user: JwtPayload }, @Param('followingId') followingId: string) {
    const followerId = req.user.sub;
    return this.followersService.toggleFollow(followerId, followingId);
  }
}
