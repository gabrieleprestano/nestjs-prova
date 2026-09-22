import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

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

export const likes = pgTable('likes', {
    id: uuid('id').defaultRandom().primaryKey(),
    created_at: timestamp('created_at').defaultNow().notNull(),

    user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    post_id: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
}, (table) => ([
    uniqueIndex('user_post_like_idx').on(table.user_id, table.post_id), // It ensures a user can like a post only once
]));

export const comments = pgTable('comments', {
    id: uuid('id').defaultRandom().primaryKey(),
    content: text('content').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),

    user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    post_id: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
});

/**
 * Relations
 * @UserRelations: A user can have many posts, likes, and comments.
 * @PostRelations: A post belongs to an author and can have many likes and comments.
 * @LikeRelations: A like belongs to a user and a post.
 * @CommentRelations: A comment belongs to a user and a post.
 */
export const usersRelations = relations(users, ({ many }) => ({
    posts: many(posts),
    likes: many(likes),
    comments: many(comments),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
    author: one(users, {
        fields: [posts.author_id],
        references: [users.id],
    }),
    likes: many(likes),
    comments: many(comments),
}));

export const likesRelations = relations(likes, ({ one }) => ({
    user: one(users, {
        fields: [likes.user_id],
        references: [users.id],
    }),
    post: one(posts, {
        fields: [likes.post_id],
        references: [posts.id],
    }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
    user: one(users, {
        fields: [comments.user_id],
        references: [users.id],
    }),
    post: one(posts, {
        fields: [comments.post_id],
        references: [posts.id],
    }),
}));

/**
 * Drizzle Infer Types
 */
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;
export type Like = InferSelectModel<typeof likes>;
export type NewLike = InferInsertModel<typeof likes>;
export type Comment = InferSelectModel<typeof comments>;
export type NewComment = InferInsertModel<typeof comments>;