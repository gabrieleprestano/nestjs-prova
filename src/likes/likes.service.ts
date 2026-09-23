import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http/driver';

/**
 * Drizzle ORM Conditions
 */
import { and, eq } from 'drizzle-orm/sql/expressions/conditions';

/**
 * Services
 */
import { UsersService } from '../users/users.service.js';

/**
 * Schema
 */
import * as schema from '../db/schema.js';

@Injectable()
export class LikesService {
    constructor(
        @Inject('drizzle')
        private readonly drizzle: NeonHttpDatabase<typeof schema>,
        private readonly usersService: UsersService,
    ) { }

    async likePostToggle(userId: string, postId: string) {
        return await this.drizzle.transaction(async (tx) => {
            const existingPost = await tx.query.posts.findFirst({
                where: eq(schema.posts.id, postId),
            });

            if (!existingPost) throw new NotFoundException('Post was not found');

            const likeAuthor = await this.usersService.findById(userId);
            const targetPostAuthor = await this.usersService.findById(existingPost.author_id);

            const likeAuthorName = likeAuthor?.name ?? 'An unknown user';
            const targetPostAuthorName = targetPostAuthor?.name ?? 'an unknown author';

            const existingLike = await tx.query.likes.findFirst({
                where: and(
                    eq(schema.likes.user_id, userId),
                    eq(schema.likes.post_id, postId)
                ),
            });

            if (existingLike) {
                await tx.delete(schema.likes).
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

            const [newLike] = await tx.insert(schema.likes).values({
                user_id: userId,
                post_id: postId,
            }).returning();

            if (existingPost.author_id !== userId) {
                await tx.insert(schema.notifications).values({
                    type: 'like',
                    user_id: existingPost.author_id,
                    post_id: postId,
                    author_id: userId,
                });
            }

            return {
                liked: true,
                message: `${likeAuthorName} liked ${targetPostAuthorName}'s post.`,
                notification: `A notification was sent to ${targetPostAuthorName}.`,
                like: newLike,
            };
        })
    }
}
