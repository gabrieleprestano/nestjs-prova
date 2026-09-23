import { Controller, Request, UseGuards, Get, Delete, Param } from '@nestjs/common';

/**
 * Types
 */
import type { Request as ExpressRequest } from 'express';
import type { JwtPayload } from '../models/types/jwt-payload.type.js';

/**
 * Services
 */
import { NotificationsService } from './notifications.service.js';

/**
 * Guards
 */
import { AuthGuard } from '../guards/auth.guard.js';


@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @UseGuards(AuthGuard)
  @Get()
  async getUserNotifications(@Request() req: ExpressRequest & { user: JwtPayload }) {
    const userId = req.user.sub;
    return this.notificationsService.getUserNotifications(userId);
  }

  @UseGuards(AuthGuard)
  @Delete('/delete/:notificationId')
  async deleteUserNotification(@Request() req: ExpressRequest & { user: JwtPayload }, @Param('notificationId') notificationId: string) {
    const userId = req.user.sub;
    return this.notificationsService.deleteNotification(userId, notificationId);
  }
}