import { User } from "../../db/schema.js";

/**
 * Types
 */
import type { PostCategory } from "../../db/schema.js";

export class PostResponseDto {
    id!: string;
    title!: string;
    content!: string;
    slug!: string;
    authorId!: string;
    category!: PostCategory;

    created_at!: Date;
    updated_at!: Date;

    author?: Pick<User, 'id' | 'name' | 'email'>;

    constructor(partial: Partial<PostResponseDto>) {
        Object.assign(this, partial);
    }
}