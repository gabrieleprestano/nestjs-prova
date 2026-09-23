import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';

/**
 * Bcrypt for password hashing
 */
import * as bcrypt from 'bcrypt';

/**
 * Database & Drizzle ORM Imports
 */
import { eq } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';

/**
 * Schema
 */
import * as schema from '../db/schema.js';
import { User } from '../db/schema.js';

/**
 * DTOs
 */
import { SignUpDto } from './dtos/sign-up.dto.js';
import { SignInDto } from './dtos/sign-in.dto.js';
import { UserResponseDto } from './dtos/user-response.dto.js';

@Injectable()
export class UsersService {
    constructor(
        @Inject('drizzle')
        private readonly drizzle: NeonDatabase<typeof schema>,
    ) { }

    private readonly passwordSaltRounds = 10;

    private toUserDto(user: User): UserResponseDto {
        return new UserResponseDto(user);
    }

    async findAll(): Promise<{ count: number; users: UserResponseDto[] }> {
        const users = await this.drizzle.select().from(schema.users);

        if (users.length === 0) return { count: 0, users: [] };

        return {
            count: users.length,
            users: users.map(this.toUserDto),
        };
    }

    async findAllWithPosts(): Promise<{ count: number; users: UserResponseDto[] }> {
        const usersWithPosts = await this.drizzle.query.users.findMany({
            with: { posts: true },
        });

        if (usersWithPosts.length === 0) return { count: 0, users: [] };

        return {
            count: usersWithPosts.length,
            users: usersWithPosts.map((user) => this.toUserDto(user))
        };
    }

    async findAdmins(): Promise<UserResponseDto[]> {
        const admins = await this.drizzle.select().from(schema.users).where(eq(schema.users.role, 'admin'));

        if (admins.length === 0) return [];

        return admins.map(this.toUserDto);
    }

    async findById(id: string): Promise<(UserResponseDto | undefined)> {
        const user = await this.drizzle.query.users.findFirst({
            where: eq(schema.users.id, id),
            with: {
                posts: {
                    with: {
                        likes: {
                            with: {
                                user: {
                                    columns: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    }
                                }
                            }
                        },
                        comments: {
                            with: {
                                user: {
                                    columns: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!user) return undefined;

        return new UserResponseDto(user);
    }

    async findByEmail(email: string): Promise<UserResponseDto[]> {
        const user = await this.drizzle.select().from(schema.users).where(eq(schema.users.email, email));

        if (user.length === 0) return [];

        return user.map(this.toUserDto);
    }

    async signUp(signUpDTO: SignUpDto): Promise<Omit<UserResponseDto, 'password'>> {
        const existingUser = await this.findByEmail(signUpDTO.email);
        if (existingUser.length > 0) throw new ConflictException('User with this email already exists.');

        const hashedPassword = await bcrypt.hash(signUpDTO.password, this.passwordSaltRounds);

        const [newUser] = await this.drizzle.insert(schema.users)
            .values({
                name: signUpDTO.name,
                email: signUpDTO.email,
                password: hashedPassword,
            })
            .returning();

        const { password, ...createdUser } = newUser;
        return createdUser;
    }

    async signIn(signInDTO: SignInDto): Promise<Omit<UserResponseDto, 'password'>> {
        const existing = await this.findByEmail(signInDTO.email);
        if (existing.length === 0) throw new UnauthorizedException('Invalid email or password.');

        const isValidPassword = await bcrypt.compare(signInDTO.password, existing[0].password);
        if (!isValidPassword) throw new UnauthorizedException('Invalid email or password.');

        // Excluding the password from the returned user object
        const { password, ...user } = existing[0];
        return user;
    }
}
