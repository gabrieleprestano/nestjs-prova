import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';

/**
 * Controllers and Services
 */
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

/**
 * Modules
 */
import { DbModule } from './db/db.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { PostsModule } from './posts/posts.module.js';
import { LikesModule } from './likes/likes.module.js';
import { CommentsModule } from './comments/comments.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    // ObserveModule.forRoot({
    //   appKey: 'YOUR_APP_KEY',
    //   appSecret: 'YOUR_APP_SECRET',
    //   serviceId: 'nestjs-prova',
    // }),
    DbModule,
    AuthModule,
    UsersModule,
    PostsModule,
    LikesModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
