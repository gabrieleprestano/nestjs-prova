import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http/driver';
import { eq } from 'drizzle-orm';

/**
 * Schema
 */
import * as schema from '../db/schema.js';

@Injectable()
export class NotificationsService {
    constructor(
        @Inject('drizzle')
        private readonly drizzle: NeonHttpDatabase<typeof schema>,
    ) { }

    async getUserNotifications(userId: string) {
        const notifications = await this.drizzle.query.notifications.findMany({
            where: eq(schema.notifications.user_id, userId),
            orderBy: (notifications, { desc }) => [desc(notifications.created_at)],
            with: {
                author: {
                    columns: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                post: true
            }
        });

        if (notifications.length === 0) return { message: 'There are no new notifications.', notifications: [] };

        return notifications;
    }

    async deleteNotification(userId: string, notificationId: string) {
        const existingNotification = await this.drizzle.query.notifications.findFirst({
            where: eq(schema.notifications.id, notificationId),
        });

        if (!existingNotification) throw new NotFoundException('Notification was not found.');

        if (existingNotification.user_id !== userId) throw new ForbiddenException('Notification does not belong to the user.');

        await this.drizzle.delete(schema.notifications).where(eq(schema.notifications.id, notificationId));
        return { message: `A notification of type ${existingNotification.type} was deleted successfully.` };
    }
}