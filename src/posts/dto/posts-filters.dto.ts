import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class PostsFiltersDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    authorId?: string;

    @IsOptional()
    @IsString()
    @IsIn(['asc', 'desc'])
    order?: 'asc' | 'desc' = 'asc'; // Default order is ascending

    @IsOptional()
    @Type(() => Number) // This ensures the value is transformed to a number
    @IsInt()
    @Min(1)
    page?: number = 1; // Default page is 1

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 10; // Default limit is 10
}