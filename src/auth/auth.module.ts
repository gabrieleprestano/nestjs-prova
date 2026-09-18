import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { AuthController } from './auth.controller.js';

@Module({
    imports: [
        JwtModule.registerAsync({
            useFactory: () => {
                const secret = process.env.JWT_SECRET;
                if (!secret) {
                    throw new Error('JWT_SECRET is not defined in environment variables.');
                }
                return {
                    secret,
                    signOptions: { expiresIn: '60m' }, // Token expires in 1h
                };
            },
        }),
    ],
    controllers: [AuthController],
    providers: [UsersService],
    exports: [JwtModule],
})
export class AuthModule { }
