import { Exclude } from 'class-transformer';
import { Post } from '../../db/schema.js';

export class UserResponseDto {
    id!: string;
    name!: string;
    email!: string;
    role!: string;

    @Exclude() // Excludes the password from the serialized output
    password!: string;

    created_at!: Date;
    updated_at!: Date;

    posts?: Post[] = [];

    constructor(partial: Partial<UserResponseDto>) {
        Object.assign(this, partial);
    }
}