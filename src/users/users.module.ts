import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [JwtModule],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule { }
