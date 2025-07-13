import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const category = sqliteTable('category', {
	id: text('id').primaryKey(),
	name: text('name').notNull().unique(),
	description: text('description'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const subscription = sqliteTable('subscription', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	name: text('name').notNull(),
	logo: text('logo'),
	price: real('price').notNull(),
	currency: text('currency').notNull().default('THB'),
	paymentEvery: text('payment_every', { mode: 'json' })
		.notNull()
		.$type<{ day: number; month: number }>(),
	nextPayment: integer('next_payment', { mode: 'timestamp' }).notNull(),
	paymentMethod: text('payment_method'),
	categoryId: text('category_id').references(() => category.id),
	paidBy: text('paid_by'),
	link: text('link'),
	notes: text('notes'),
	disabled: integer('disabled', { mode: 'boolean' }).notNull().default(false),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Category = typeof category.$inferSelect;
export type Subscription = typeof subscription.$inferSelect;

export type NewCategory = typeof category.$inferInsert;
export type NewSubscription = typeof subscription.$inferInsert;
