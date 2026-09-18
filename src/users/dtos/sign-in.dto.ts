/**
 * Validators
 */
import { IsEmail, MinLength } from 'class-validator';

const PASSWORD_LENGTH = 6;

export class SignInDto {
    @IsEmail()
    email!: string;

    @MinLength(PASSWORD_LENGTH, { message: `Password must be at least ${PASSWORD_LENGTH} characters long` })
    password!: string;
}