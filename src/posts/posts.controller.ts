/**
 * NestJS Common
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/common';

/**
 * Services
 */
import { PostsService } from './posts.service.js';

/**
 * DTOs
 */
import { CreatePostDto } from './dto/create-post.dto.js';
import { PostsFiltersDto } from './dto/posts-filters.dto.js';

/**
 * Types
 */
import type { Request as ExpressRequest } from 'express';
import type { JwtPayload } from '../models/types/jwt-payload.type.js';

/**
 * Guards
 */
import { AuthGuard } from '../guards/auth.guard.js';
import { AdminGuard } from '../guards/admin.guard.js';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @Get('/all')
  findAll(@Query() queryFilters: PostsFiltersDto) {
    return this.postsService.findAll(queryFilters);
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Post('/add')
  create(@Body() createPostDto: CreatePostDto, @Request() req: ExpressRequest & { user: JwtPayload }) {
    return this.postsService.create(createPostDto, req.user.sub);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Patch('/update/:id')
  update(@Param('id') id: string, @Body() updatePostDto: Partial<CreatePostDto>) {
    return this.postsService.update(id, updatePostDto);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Delete('/delete/:id')
  delete(@Param('id') id: string) {
    return this.postsService.delete(id);
  }
}
