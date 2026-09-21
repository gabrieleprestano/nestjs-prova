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

  async findAll() {
    const posts = await this.drizzle.query.posts.findMany({
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        }
      }
    });

    if (posts.length === 0) return { count: 0, posts: [] };

    return {
      count: posts.length,
      posts: posts.map(post => this.toPostDto(post))
    };
  }

  async findOne(id: string) {
    const post = await this.drizzle.query.posts.findFirst({
      where: eq(schema.posts.id, id),
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        }
      }
    });

    if (!post) return null;

    return this.toPostDto(post);
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

  async update(id: string, updatePostDto: Partial<CreatePostDto>) {
    const postToUpdate = await this.drizzle.query.posts.findFirst({
      where: eq(schema.posts.id, id),
    });

    if (!postToUpdate) throw new ConflictException('Post not found');

    const [updatedPost] = await this.drizzle.update(schema.posts).set({
      title: updatePostDto.title ?? postToUpdate.title,
      content: updatePostDto.content ?? postToUpdate.content
    }).where(eq(schema.posts.id, id)).returning();

    return {
      message: `Post: "${updatedPost.title}" updated successfully`,
      post: this.toPostDto(updatedPost)
    };
  }

  async delete(id: string) {
    const postToDelete = await this.drizzle.query.posts.findFirst({
      where: eq(schema.posts.id, id),
    });

    if (!postToDelete) throw new ConflictException('Post not found');

    await this.drizzle.delete(schema.posts).where(eq(schema.posts.id, id));

    return {
      message: `Post: "${postToDelete.title}" deleted successfully`,
    };
  }
}
