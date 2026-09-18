import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';

/**
 * Services
 */
import { UsersService } from '../users/users.service.js';

/**
 * Types
 */
import type { Post } from '../db/schema.js';

/**
 * Database & Drizzle ORM Imports
 */
import { eq } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http/driver';

/**
 * DTOs
 */
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { PostResponseDto } from './dto/post-response.dto.js';

/**
 * Schema
 */
import * as schema from '../db/schema.js';

@Injectable()
export class PostsService {
  constructor(
    @Inject('drizzle')
    private readonly drizzle: NeonHttpDatabase<typeof schema>,
    private readonly usersService: UsersService,
  ) { }

  private toPostDto(post: Post): PostResponseDto {
    return new PostResponseDto(post);
  }

  async create(createPostDto: CreatePostDto, authorId: string) {
    const existingPost = await this.drizzle.select().from(schema.posts).where(eq(schema.posts.title, createPostDto.title));

    if (existingPost.length > 0) throw new ConflictException('Post with this title already exists');

    const [newPost] = await this.drizzle.insert(schema.posts).values({
      title: createPostDto.title,
      content: createPostDto.content,
      author_id: authorId
    }).returning();

    const postAuthor = await this.usersService.findById(authorId);

    return {
      message: `Post: "${newPost.title}" created successfully by ${postAuthor?.name ?? 'Unknown'}`,
      post: this.toPostDto(newPost)
    };
  }

  async findAll() {
    const posts = await this.drizzle.query.posts.findMany({
      with: { author: true, select: { id: true, name: true, email: true } }
    })

    if (posts.length === 0) return { count: 0, posts: [] };

    return {
      count: posts.length,
      posts: posts.map(post => this.toPostDto(post))
    };
  }
}
