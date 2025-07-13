import { db } from '$lib/server/db';
import { subscription, category } from '$lib/server/db/schema';
import type { Subscription, NewSubscription, Category } from '$lib/server/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { encodeBase32LowerCase } from '@oslojs/encoding';

export interface SubscriptionWithCategory extends Subscription {
	category?: Category | null;
}

export interface CreateSubscriptionData {
	name: string;
	logo?: string;
	price: number;
	currency: string;
	paymentEvery: { day: number; month: number };
	nextPayment: Date;
	paymentMethod?: string;
	categoryId?: string;
	paidBy?: string;
	link?: string;
	notes?: string;
}

export interface UpdateSubscriptionData extends Partial<CreateSubscriptionData> {
	disabled?: boolean;
}

export interface SubscriptionFilters {
	categoryId?: string;
	disabled?: boolean;
	currency?: string;
	paidBy?: string;
}

export interface SubscriptionSort {
	field: 'name' | 'price' | 'nextPayment' | 'createdAt';
	direction: 'asc' | 'desc';
}

export async function createSubscription(
	userId: string,
	data: CreateSubscriptionData
): Promise<Subscription> {
	const id = generateUserId();
	const now = new Date();

	const newSubscription: NewSubscription = {
		id,
		userId,
		...data,
		createdAt: now,
		updatedAt: now
	};

	await db.insert(subscription).values(newSubscription);

	const [created] = await db.select().from(subscription).where(eq(subscription.id, id));
	return created;
}

export async function getSubscription(
	id: string,
	userId: string
): Promise<SubscriptionWithCategory | null> {
	const [result] = await db
		.select({
			subscription: subscription,
			category: category
		})
		.from(subscription)
		.leftJoin(category, eq(subscription.categoryId, category.id))
		.where(and(eq(subscription.id, id), eq(subscription.userId, userId)));

	if (!result) return null;

	return {
		...result.subscription,
		category: result.category
	};
}

export async function getSubscriptionById(id: string): Promise<SubscriptionWithCategory | null> {
	const [result] = await db
		.select({
			subscription: subscription,
			category: category
		})
		.from(subscription)
		.leftJoin(category, eq(subscription.categoryId, category.id))
		.where(eq(subscription.id, id));

	if (!result) return null;

	return {
		...result.subscription,
		category: result.category
	};
}

export async function getSubscriptions(
	userId: string,
	filters: SubscriptionFilters = {},
	sort: SubscriptionSort = { field: 'nextPayment', direction: 'asc' }
): Promise<SubscriptionWithCategory[]> {
	// Build conditions
	const conditions = [eq(subscription.userId, userId)];

	if (filters.categoryId) {
		conditions.push(eq(subscription.categoryId, filters.categoryId));
	}

	if (filters.disabled !== undefined) {
		conditions.push(eq(subscription.disabled, filters.disabled));
	}

	if (filters.currency) {
		conditions.push(eq(subscription.currency, filters.currency));
	}

	if (filters.paidBy) {
		conditions.push(eq(subscription.paidBy, filters.paidBy));
	}

	// Apply sorting
	const sortField = subscription[sort.field];
	const orderBy = sort.direction === 'asc' ? asc(sortField) : desc(sortField);

	const results = await db
		.select({
			subscription: subscription,
			category: category
		})
		.from(subscription)
		.leftJoin(category, eq(subscription.categoryId, category.id))
		.where(and(...conditions))
		.orderBy(orderBy);

	return results.map((result) => ({
		...result.subscription,
		category: result.category
	}));
}

export async function updateSubscription(
	id: string,
	userId: string,
	data: UpdateSubscriptionData
): Promise<Subscription | null> {
	const updateData = {
		...data,
		updatedAt: new Date()
	};

	await db
		.update(subscription)
		.set(updateData)
		.where(and(eq(subscription.id, id), eq(subscription.userId, userId)));

	const [updated] = await db
		.select()
		.from(subscription)
		.where(and(eq(subscription.id, id), eq(subscription.userId, userId)));

	return updated || null;
}

export async function deleteSubscription(id: string, userId: string): Promise<boolean> {
	await db
		.delete(subscription)
		.where(and(eq(subscription.id, id), eq(subscription.userId, userId)));

	// Check if the subscription still exists
	const [remaining] = await db
		.select()
		.from(subscription)
		.where(and(eq(subscription.id, id), eq(subscription.userId, userId)));

	return !remaining; // Returns true if deletion was successful (subscription no longer exists)
}

export async function getUpcomingSubscriptions(
	userId: string,
	days: number = 7
): Promise<SubscriptionWithCategory[]> {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() + days);

	const results = await db
		.select({
			subscription: subscription,
			category: category
		})
		.from(subscription)
		.leftJoin(category, eq(subscription.categoryId, category.id))
		.where(and(eq(subscription.userId, userId), eq(subscription.disabled, false)))
		.orderBy(asc(subscription.nextPayment));

	return results
		.filter((result) => result.subscription.nextPayment <= cutoffDate)
		.map((result) => ({
			...result.subscription,
			category: result.category
		}));
}

export async function getTotalsByCategory(
	userId: string
): Promise<{ [categoryName: string]: number }> {
	const results = await db
		.select({
			subscription: subscription,
			category: category
		})
		.from(subscription)
		.leftJoin(category, eq(subscription.categoryId, category.id))
		.where(and(eq(subscription.userId, userId), eq(subscription.disabled, false)));

	const totals: { [categoryName: string]: number } = {};

	for (const result of results) {
		const categoryName = result.category?.name || 'Uncategorized';
		const monthlyAmount = calculateMonthlyAmount(
			result.subscription.price,
			result.subscription.paymentEvery
		);

		totals[categoryName] = (totals[categoryName] || 0) + monthlyAmount;
	}

	return totals;
}

export function calculateMonthlyAmount(
	price: number,
	paymentEvery: { day: number; month: number }
): number {
	// Convert payment frequency to monthly equivalent
	// month: 1 = monthly, 12 = yearly, 3 = quarterly, etc.
	return price / paymentEvery.month;
}

export function calculateNextPayment(
	currentNext: Date,
	paymentEvery: { day: number; month: number }
): Date {
	const next = new Date(currentNext);
	next.setMonth(next.getMonth() + paymentEvery.month);

	// Ensure we don't go past the intended day of month
	const targetDay = paymentEvery.day;
	if (next.getDate() !== targetDay) {
		next.setDate(targetDay);
	}

	return next;
}

function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}
