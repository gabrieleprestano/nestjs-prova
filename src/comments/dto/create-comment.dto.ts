import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateCommentDto {
    @IsString({ message: 'Content must be a string' })
    @IsNotEmpty({ message: 'Content must not be empty' })
    @MinLength(5, { message: 'Content must be at least 5 characters long' })
    @MaxLength(500, { message: 'Content must be at most 500 characters long' })
    content!: string;
}