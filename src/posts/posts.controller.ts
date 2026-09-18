import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';

/**
 * Services
 */
import { PostsService } from './posts.service.js';

/**
 * DTOs
 */
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';

/**
 * Types
 */
import type { Request as ExpressRequest } from 'express';
import { JwtPayload } from '../models/types/jwt-payload.type.js';

/**
 * Guards
 */
import { AuthGuard } from '../guards/auth.guard.js';
import { AdminGuard } from '../guards/admin.guard.js';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @UseGuards(AuthGuard, AdminGuard)
  @Post('/add')
  create(@Body() createPostDto: CreatePostDto, @Request() req: ExpressRequest & { user: JwtPayload }) {
    return this.postsService.create(createPostDto, req.user.sub);
  }

  @Get('/all')
  findAll() {
    return this.postsService.findAll();
  }
}
