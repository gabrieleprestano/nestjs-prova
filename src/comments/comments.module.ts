import { Module } from '@nestjs/common';

/**
 * Modules
 */
import { JwtModule } from '@nestjs/jwt';

/**
 * Services
 */
import { CommentsService } from './comments.service.js';
import { UsersService } from '../users/users.service.js';

/**
 * Controllers
 */
import { CommentsController } from './comments.controller.js';

@Module({
  imports: [JwtModule],
  controllers: [CommentsController],
  providers: [CommentsService, UsersService],
})
export class CommentsModule { }
