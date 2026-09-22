import { Exclude } from 'class-transformer';

/**
 * Entities
 */
import { Post } from '../../db/schema.js';

/**
 * Types
 */
import type { UserRole } from '../../db/schema.js';

export class UserResponseDto {
    id!: string;
    name!: string;
    email!: string;
    role!: UserRole;

    @Exclude() // Excludes the password from the serialized output
    password!: string;

    created_at!: Date;
    updated_at!: Date;

    posts?: Post[] = [];

    constructor(partial: Partial<UserResponseDto>) {
        Object.assign(this, partial);
    }
}