import { IsString, MaxLength, MinLength, IsNotEmpty, IsOptional, IsIn } from "class-validator";

/**
 * Types and Constants
 */
import type { PostCategory } from "../../db/schema.js";
import { POST_CATEGORIES } from "../../db/schema.js";

export class CreatePostDto {
    @IsString({ message: 'Title must be a string' })
    @IsNotEmpty({ message: 'Title cannot be empty' })
    @MinLength(3, { message: 'Title must be at least 3 characters long' })
    @MaxLength(100, { message: 'Title must be at most 100 characters long' })
    title!: string;

    @IsString({ message: 'Content must be a string' })
    @IsNotEmpty({ message: 'Content cannot be empty' })
    @MinLength(3, { message: 'Content must be at least 3 characters long' })
    @MaxLength(100, { message: 'Content must be at most 100 characters long' })
    content!: string;

    @IsOptional() // If not provided, the default category will be used
    @IsIn(POST_CATEGORIES, { message: 'Category must be valid.' })
    @IsString({ message: 'Category must be a string' })
    category!: PostCategory;
}
