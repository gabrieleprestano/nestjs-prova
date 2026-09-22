import { Controller, Post, Request, Param, UseGuards } from '@nestjs/common';

/**
 * Types
 */
import type { Request as ExpressRequest } from 'express';
import type { JwtPayload } from '../models/types/jwt-payload.type.js';

/**
 * Services
 */
import { LikesService } from './likes.service.js';

/**
 * Guards
 */
import { AuthGuard } from '../guards/auth.guard.js';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) { }

  @UseGuards(AuthGuard)
  @Post('/:postId')
  async likePostToggle(@Request() req: ExpressRequest & { user: JwtPayload }, @Param('postId') postId: string) {
    return this.likesService.likePostToggle(req.user.sub, postId);
  }
}
