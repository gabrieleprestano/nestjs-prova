import { ForbiddenException, Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';

/**
 * ORM
 */
import { and, eq } from 'drizzle-orm';

/**
 * Services
 */
import { UsersService } from '../users/users.service.js';

/**
 * Schema
 */
import * as schema from '../db/schema.js';

@Injectable()
export class FollowersService {
    constructor(
        @Inject('drizzle')
        private readonly drizzle: NeonHttpDatabase<typeof schema>,
        private readonly usersService: UsersService,
    ) { }

    async toggleFollow(followerId: string, followingId: string) {
        return await this.drizzle.transaction(async (tx) => {
            const followerUser = await this.usersService.findById(followerId);
            const existingFollowingUser = await this.usersService.findById(followingId);

            if (!existingFollowingUser) throw new NotFoundException('User was not found');

            const followerUserName = followerUser?.name ?? 'An unknown user';
            const existingFollowingUserName = existingFollowingUser?.name ?? 'an unknown user';

            const existingFollow = await tx.query.followers.findFirst({
                where: and(
                    eq(schema.followers.follower_id, followerId),
                    eq(schema.followers.following_id, followingId),
                )
            });

            if (followerId === followingId) throw new ForbiddenException('You cannot follow yourself.');

            if (existingFollow) {
                await tx.delete(schema.followers)
                    .where(
                        and(
                            eq(schema.followers.follower_id, followerId),
                            eq(schema.followers.following_id, followingId)
                        )
                    );

                return {
                    isFollowing: false,
                    message: `${followerUserName} unfollowed ${existingFollowingUserName}.`
                };
            }

            await tx.insert(schema.followers).values({
                follower_id: followerId,
                following_id: followingId,
            });

            await tx.insert(schema.notifications).values({
                type: 'follow',
                user_id: followingId,
                author_id: followerId,
            });

            return {
                isFollowing: true,
                message: `${followerUserName} followed ${existingFollowingUserName}.`,
                notification: `A notification was sent to ${existingFollowingUserName}.`
            };
        });
    }
}
