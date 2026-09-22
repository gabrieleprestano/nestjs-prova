import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

/**
 * Enums
 */
enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

enum PostCategory {
    GENERIC = 'generic',
    TECHNOLOGY = 'technology',
    LIFESTYLE = 'lifestyle',
    HEALTH = 'health',
    EDUCATION = 'education',
    HISTORY = 'history',
    ENTERTAINMENT = 'entertainment',
    SPORTS = 'sports',
    TRAVEL = 'travel',
    FOOD = 'food',
    FASHION = 'fashion',
    BUSINESS = 'business',
    SCIENCE = 'science',
    ART = 'art',
    POLITICS = 'politics',
}

/**
 * Tables
 */
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: text('role').notNull().default(UserRole.USER),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const posts = pgTable('posts', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').unique().notNull(),
    content: text('content').notNull(),
    category: text('category').notNull().default(PostCategory.GENERIC),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),

    author_id: uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' })
});

/**
 * Relations
 */
export const usersRelations = relations(users, ({ many }) => ({
    posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
    author: one(users, {
        fields: [posts.author_id],
        references: [users.id],
    }),
}));

/**
 * Drizzle Infer Types
 */
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;