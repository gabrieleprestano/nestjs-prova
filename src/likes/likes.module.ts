import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

/**
 * Controllers
 */
import { LikesController } from './likes.controller.js';

/**
 * Services
 */
import { LikesService } from './likes.service.js';
import { UsersService } from '../users/users.service.js';


@Module({
  controllers: [LikesController],
  imports: [JwtModule],
  providers: [LikesService, UsersService],
})
export class LikesModule { }
