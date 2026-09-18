import { IsString, MaxLength, MinLength, IsNotEmpty } from "class-validator";

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
}
