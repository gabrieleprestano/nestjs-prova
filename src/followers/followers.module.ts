import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

/**
 * Services and Controllers
 */
import { FollowersService } from './followers.service.js';
import { UsersService } from '../users/users.service.js';
import { FollowersController } from './followers.controller.js';

@Module({
  imports: [JwtModule],
  controllers: [FollowersController],
  providers: [FollowersService, UsersService],
})
export class FollowersModule { }
