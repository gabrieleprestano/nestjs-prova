import { Controller, Get, UseGuards, Request, Param, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';

/**
 * Services
 */
import { UsersService } from './users.service.js';

/**
 * Guards
 */
import { AuthGuard } from '../guards/auth.guard.js';
import { AdminGuard } from '../guards/admin.guard.js';

/**
 * Types
 */
import type { Request as ExpressRequest } from 'express';
import type { JwtPayload } from '../models/types/jwt-payload.type.js';

@UseInterceptors(ClassSerializerInterceptor) // It deletes all the fields marked with @Exclude() from the serialized output
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(AuthGuard)
    @Get('/profile')
    async getProfile(@Request() req: ExpressRequest & { user: JwtPayload }) {
        return this.usersService.findById(req.user.sub)
    }

    @UseGuards(AuthGuard, AdminGuard)
    @Get()
    async getAllUsers() {
        return this.usersService.findAll();
    }

    @UseGuards(AuthGuard, AdminGuard)
    @Get('/all')
    async getAllUsersWithPosts() {
        return this.usersService.findAllWithPosts();
    }

    @UseGuards(AuthGuard, AdminGuard)
    @Get('/:id')
    async getUserById(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @UseGuards(AuthGuard, AdminGuard)
    @Get('/admins')
    async getAdmins() {
        return this.usersService.findAdmins();
    }
}
