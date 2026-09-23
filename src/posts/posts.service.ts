import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { ConflictException, Inject, Injectable } from '@nestjs/common';

/**
 * External Libraries
 */
import slugify from 'slugify';

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
import { eq, or, SQL, ilike, asc, desc, and, count } from 'drizzle-orm';

/**
 * DTOs
 */
import { CreatePostDto } from './dto/create-post.dto.js';
import { PostResponseDto } from './dto/post-response.dto.js';
import { PostsFiltersDto } from './dto/posts-filters.dto.js';

/**
 * Schema
 */
import * as schema from '../db/schema.js';

@Injectable()
export class PostsService {
  constructor(
    @Inject('drizzle')
    private readonly drizzle: NeonDatabase<typeof schema>,
    private readonly usersService: UsersService,
  ) { }

  private toPostDto(post: Post): PostResponseDto {
    return new PostResponseDto(post);
  }

  async findAll(queryFilters: PostsFiltersDto): Promise<{ count: number; page: number; limit: number; totalPages: number; posts: PostResponseDto[] }> {
    const { search, authorId, order, category, page = 1, limit = 10 } = queryFilters;

    const paginationOffset = (page - 1) * limit;

    const conditions: SQL[] = [];

    if (search) {
      // Create a search condition for the title and content fields using the ilike operator for case-insensitive matching
      const searchCondition = or(
        ilike(schema.posts.title, `%${search}%`),
        ilike(schema.posts.content, `%${search}%`)
      );

      if (searchCondition) conditions.push(searchCondition);
    }

    if (authorId) conditions.push(eq(schema.posts.author_id, authorId));

    if (category) conditions.push(eq(schema.posts.category, category));

    const orderBy = order === 'asc'
      ? asc(schema.posts.created_at)
      : order === 'desc'
        ? desc(schema.posts.created_at)
        : asc(schema.posts.created_at); // Default order by created_at ascending if no order is specified

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.drizzle
      .select({ total: count() })
      .from(schema.posts)
      .where(where);

    if (total === 0) return { count: 0, page: page, limit: limit, totalPages: 0, posts: [] };

    const posts = await this.drizzle.query.posts.findMany({
      where: where,
      orderBy: orderBy,
      limit: limit,
      offset: paginationOffset,
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        likes: true,
        comments: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            }
          }
        },
      }
    });

    return {
      count: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
      posts: posts.map(post => this.toPostDto(post))
    };
  }

  async findOne(id: string): Promise<PostResponseDto | null> {
    const post = await this.drizzle.query.posts.findFirst({
      where: eq(schema.posts.id, id),
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        likes: true,
        comments: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            }
          }
        },
      }
    });

    if (!post) return null;

    return this.toPostDto(post);
  }

  async create(createPostDto: CreatePostDto, authorId: string): Promise<{ message: string; post: PostResponseDto }> {
    const postDtoSlug = slugify(createPostDto.title, { lower: true, strict: true });
    const existingPost = await this.drizzle.select().from(schema.posts).where(eq(schema.posts.slug, postDtoSlug));

    if (existingPost.length > 0) throw new ConflictException('Post with this title already exists');

    const titleSlug = postDtoSlug;

    const [newPost] = await this.drizzle.insert(schema.posts).values({
      title: createPostDto.title,
      content: createPostDto.content,
      category: createPostDto.category,
      author_id: authorId,
      slug: titleSlug
    }).returning();

    const postAuthor = await this.usersService.findById(authorId);

    return {
      message: `Post: "${newPost.title}" created successfully by ${postAuthor?.name ?? 'Unknown'}`,
      post: this.toPostDto(newPost)
    };
  }

  async update(id: string, updatePostDto: Partial<CreatePostDto>): Promise<{ message: string; post: PostResponseDto }> {
    const postToUpdate = await this.drizzle.query.posts.findFirst({
      where: eq(schema.posts.id, id),
    });

    if (!postToUpdate) throw new ConflictException('Post not found');

    const [updatedPost] = await this.drizzle.update(schema.posts).set({
      title: updatePostDto.title ?? postToUpdate.title,
      content: updatePostDto.content ?? postToUpdate.content,
      slug: updatePostDto.title ? slugify(updatePostDto.title, { lower: true, strict: true })
        : postToUpdate.slug,
      category: updatePostDto.category ?? postToUpdate.category,
    }).where(eq(schema.posts.id, id)).returning();

    return {
      message: `Post: "${updatedPost.title}" updated successfully`,
      post: this.toPostDto(updatedPost)
    };
  }

  async delete(id: string): Promise<{ message: string }> {
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
