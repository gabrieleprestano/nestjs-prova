import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http/driver';

/**
 * Services
 */
import { UsersService } from '../users/users.service.js';

/**
 * Schema
 */
import * as schema from '../db/schema.js';
import { and, eq } from 'drizzle-orm/sql/expressions/conditions';

@Injectable()
export class LikesService {
    constructor(
        @Inject('drizzle')
        private readonly drizzle: NeonHttpDatabase<typeof schema>,
        private readonly usersService: UsersService,
    ) { }

    async likePostToggle(userId: string, postId: string) {
        const existingPost = await this.drizzle.query.posts.findFirst({
            where: eq(schema.posts.id, postId),
        });

        if (!existingPost) throw new NotFoundException('Post was not found');

        const likeAuthor = await this.usersService.findById(userId);
        const targetPostAuthor = await this.usersService.findById(existingPost.author_id);

        const likeAuthorName = likeAuthor?.name ?? 'An unknown user';
        const targetPostAuthorName = targetPostAuthor?.name ?? 'an unknown author';

        const existingLike = await this.drizzle.query.likes.findFirst({
            where: and(
                eq(schema.likes.user_id, userId),
                eq(schema.likes.post_id, postId)
            ),
        });

        if (existingLike) {
            await this.drizzle.delete(schema.likes).
                where(
                    and(
                        eq(schema.likes.user_id, userId),
                        eq(schema.likes.post_id, postId)
                    ),
                );

            return {
                liked: false,
                message: `${likeAuthorName} unliked ${targetPostAuthorName}'s post.`
            }
        }

        const [newLike] = await this.drizzle.insert(schema.likes).values({
            user_id: userId,
            post_id: postId,
        }).returning();

        return {
            liked: true,
            message: `${likeAuthorName} liked ${targetPostAuthorName}'s post.`,
            like: newLike,
        };
    }
}
