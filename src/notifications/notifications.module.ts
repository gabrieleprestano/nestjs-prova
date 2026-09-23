import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

/**
 * Controllers and Services
 */
import { NotificationsService } from './notifications.service.js';
import { NotificationsController } from './notifications.controller.js';

@Module({
  imports: [JwtModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule { }
