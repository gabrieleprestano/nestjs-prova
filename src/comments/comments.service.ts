import { Inject, Injectable } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { NotFoundException } from '@nestjs/common';

/**
 * ORM
 */
import { eq } from 'drizzle-orm';

/**
 * DTOs
 */
import { CreateCommentDto } from './dto/create-comment.dto.js';

/**
 * Services
 */
import { UsersService } from '../users/users.service.js';

/**
 * Schema
 */
import * as schema from '../db/schema.js';

@Injectable()
export class CommentsService {
    constructor(
        @Inject('drizzle')
        private readonly drizzle: NeonDatabase<typeof schema>,
        private readonly usersService: UsersService,
    ) { }

    async addComment(userId: string, postId: string, createCommentDto: CreateCommentDto) {
        return await this.drizzle.transaction(async (tx) => {
            const existingPost = await tx.query.posts.findFirst({
                where: eq(schema.posts.id, postId),
            });

            if (!existingPost) throw new NotFoundException('Post was not found');

            const commentAuthor = await this.usersService.findById(userId);
            const targetPostAuthor = await this.usersService.findById(existingPost.author_id);

            const commentAuthorName = commentAuthor?.user.name ?? 'An unknown user';
            const targetPostAuthorName = targetPostAuthor?.user.name ?? 'an unknown author';

            const [newComment] = await tx.insert(schema.comments).values({
                content: createCommentDto.content,
                user_id: userId,
                post_id: postId,
            }).returning();

            if (existingPost.author_id !== userId) {
                await tx.insert(schema.notifications).values({
                    type: 'comment',
                    user_id: existingPost.author_id,
                    post_id: postId,
                    author_id: userId,
                });
            }

            return {
                message: `${commentAuthorName} commented on ${targetPostAuthorName}'s post`,
                notification: `A notification was sent to ${targetPostAuthorName}.`,
                comment: newComment,
            }
        })
    }

    async deleteComment(userId: string, commentId: string) {
        const existingComment = await this.drizzle.query.comments.findFirst({
            where: eq(schema.comments.id, commentId),
        });

        if (!existingComment) throw new NotFoundException('Comment was not found');

        if (existingComment.user_id !== userId) throw new NotFoundException('You are not the author of this comment.');

        await this.drizzle.delete(schema.comments).where(eq(schema.comments.id, commentId));

        return {
            message: 'Comment deleted successfully',
        };
    }
}
