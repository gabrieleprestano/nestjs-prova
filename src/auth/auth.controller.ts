/**
 * Nest JS Libraries for Auth
 */
import { Controller, Post, Body, Res, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';

/**
 * Constants
 */
import { cookieOptions } from '../models/constants/cookie_options.js';

/**
 * Type for the Express Response Object
 */
import type { Response } from 'express';

/**
 * Services
 */
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';

/**
 * DTOs for User Authentication
 */
import { SignUpDto } from '../users/dtos/sign-up.dto.js';
import { SignInDto } from '../users/dtos/sign-in.dto.js';

/**
 * Guards
 */
import { NoAuthGuard } from '../guards/no-auth.guard.js';
import { AuthGuard } from '../guards/auth.guard.js';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    // Options for the HTTP-only cookie containing the JWT token
    cookieOptions = cookieOptions;

    /**
     * By default the HTTP status code for @POST requests is 201 (Created), however
     * in this controller we explicitly set the status code for signIn and signOut
     * to 200 (OK) using the @HttpCode decorator.
     * 
     * @Res({ passthrough: true }) @decorator is used to inject the Express Response object into the controller methods to allow setting cookies and manipulating the response directly.
     */

    @UseGuards(NoAuthGuard)
    @Post('sign-up')
    async signUp(
        @Body() signUpDto: SignUpDto,
        @Res({ passthrough: true }) response: Response) {
        const newUser = await this.usersService.signUp(signUpDto);

        // Generating the payload for the JWT token
        const payload = {
            sub: newUser.id,
            email: newUser.email,
            role: newUser.role,
        };
        const token = await this.jwtService.signAsync(payload);

        // Setting the JWT token as an HTTP-only cookie
        response.cookie('access_token', token, this.cookieOptions);

        return {
            message: `User with email: ${newUser.email} was successfully registered`,
            user: newUser
        };
    }

    @UseGuards(NoAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('sign-in')
    async signIn(
        @Body() signInDto: SignInDto,
        @Res({ passthrough: true }) response: Response) {
        const user = await this.usersService.signIn(signInDto);

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const token = await this.jwtService.signAsync(payload);

        response.cookie('access_token', token, this.cookieOptions);

        return {
            message: `User with email: ${user.email} was successfully signed in`,
            user: user
        };
    }

    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('sign-out')
    async signOut(
        @Res({ passthrough: true }) response: Response) {
        // Clearing the JWT token cookie to sign out the user
        response.clearCookie('access_token', this.cookieOptions);
        return { message: 'User was successfully signed out' }
    }
}