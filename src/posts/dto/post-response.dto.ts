import { User } from "../../db/schema.js";

export class PostResponseDto {
    id!: string;
    title!: string;
    content!: string;
    authorId!: string;

    created_at!: Date;
    updated_at!: Date;

    author?: Pick<User, 'id' | 'name' | 'email'>;

    constructor(partial: Partial<PostResponseDto>) {
        Object.assign(this, partial);
    }
}