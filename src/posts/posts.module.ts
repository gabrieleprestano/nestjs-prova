import { Module } from '@nestjs/common';
import { PostsService } from './posts.service.js';
import { PostsController } from './posts.controller.js';
import { UsersService } from '../users/users.service.js';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  controllers: [PostsController],
  providers: [PostsService, UsersService],
})
export class PostsModule { }
