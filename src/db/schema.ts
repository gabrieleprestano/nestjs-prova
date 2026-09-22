import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

/**
 * Constants (Union Types for User Roles and Post Categories)
 */
export const USER_ROLES = ['admin', 'user'] as const;

export const POST_CATEGORIES = [
    'generic',
    'technology',
    'lifestyle',
    'health',
    'education',
    'history',
    'entertainment',
    'sports',
    'travel',
    'food',
    'fashion',
    'business',
    'science',
    'art',
    'politics',
] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type PostCategory = (typeof POST_CATEGORIES)[number];

/**
 * Tables
 */
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: text('role').$type<UserRole>().notNull().default('user'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const posts = pgTable('posts', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').unique().notNull(),
    content: text('content').notNull(),
    category: text('category').$type<PostCategory>().notNull().default('generic'),
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