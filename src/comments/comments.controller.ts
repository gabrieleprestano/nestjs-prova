import { Controller, Post, Param, UseGuards, Request, Body, Delete } from '@nestjs/common';

/**
 * Types
 */
import type { Request as ExpressRequest } from 'express';
import type { JwtPayload } from '../models/types/jwt-payload.type.js';
import type { CreateCommentDto } from './dto/create-comment.dto.js';

/**
 * Services
 */
import { CommentsService } from './comments.service.js';

/**
 * Guards
 */
import { AuthGuard } from '../guards/auth.guard.js';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @UseGuards(AuthGuard)
  @Post('add/:postId')
  async createCommentOnPost(
    @Request() req: ExpressRequest & { user: JwtPayload },
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.addComment(req.user.sub, postId, createCommentDto);
  }

  @UseGuards(AuthGuard)
  @Delete('/:commentId')
  async deleteCommentOnPost(
    @Request() req: ExpressRequest & { user: JwtPayload },
    @Param('commentId') commentId: string,
  ) {
    return this.commentsService.deleteComment(req.user.sub, commentId);
  }
}
