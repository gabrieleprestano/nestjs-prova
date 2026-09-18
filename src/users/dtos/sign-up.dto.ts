/**
 * Validators
 */
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

const PASSWORD_MIN_LENGTH = 6;
const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 10;

export class SignUpDto {
    @MinLength(NAME_MIN_LENGTH, { message: `Name must be at least ${NAME_MIN_LENGTH} characters long` })
    @MaxLength(NAME_MAX_LENGTH, { message: `Name must be at most ${NAME_MAX_LENGTH} characters long` })
    name!: string;

    @IsEmail({}, { message: 'Invalid email format' })
    email!: string;

    @MinLength(PASSWORD_MIN_LENGTH, { message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long` })
    password!: string;
}