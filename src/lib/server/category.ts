import { db } from '$lib/server/db';
import { category } from '$lib/server/db/schema';
import type { Category, NewCategory } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { encodeBase32LowerCase } from '@oslojs/encoding';

export interface CreateCategoryData {
	name: string;
	description?: string;
}

export async function createCategory(data: CreateCategoryData): Promise<Category> {
	const id = generateUserId();
	const now = new Date();

	const newCategory: NewCategory = {
		id,
		name: data.name,
		description: data.description,
		createdAt: now,
		updatedAt: now
	};

	await db.insert(category).values(newCategory);

	const [created] = await db.select().from(category).where(eq(category.id, id));
	return created;
}

export async function getCategory(id: string): Promise<Category | null> {
	const [result] = await db.select().from(category).where(eq(category.id, id));
	return result || null;
}

export async function getCategories(): Promise<Category[]> {
	return await db.select().from(category).orderBy(desc(category.name));
}

export async function updateCategory(
	id: string,
	data: Partial<CreateCategoryData>
): Promise<Category | null> {
	const updateData = {
		...data,
		updatedAt: new Date()
	};

	await db.update(category).set(updateData).where(eq(category.id, id));

	const [updated] = await db.select().from(category).where(eq(category.id, id));
	return updated || null;
}

export async function deleteCategory(id: string): Promise<boolean> {
	await db.delete(category).where(eq(category.id, id));

	// Check if the category still exists
	const [remaining] = await db.select().from(category).where(eq(category.id, id));
	return !remaining; // Returns true if deletion was successful
}

export async function getDefaultCategories(): Promise<CreateCategoryData[]> {
	return [
		{ name: 'Entertainment', description: 'Streaming services, games, and media' },
		{ name: 'Work', description: 'Professional tools and software' },
		{ name: 'Utilities', description: 'Internet, phone, and essential services' },
		{ name: 'Health & Fitness', description: 'Gym memberships and health apps' },
		{ name: 'Education', description: 'Courses, books, and learning platforms' },
		{ name: 'Finance', description: 'Banking, investment, and financial services' },
		{ name: 'Shopping', description: 'E-commerce and retail subscriptions' },
		{ name: 'Cloud Storage', description: 'File storage and backup services' }
	];
}

export async function createDefaultCategories(): Promise<Category[]> {
	const defaultCategories = await getDefaultCategories();
	const created: Category[] = [];

	for (const categoryData of defaultCategories) {
		try {
			const category = await createCategory(categoryData);
			created.push(category);
		} catch (error) {
			// Skip if category already exists (unique constraint)
			console.warn(`Category "${categoryData.name}" already exists`);
		}
	}

	return created;
}

function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}
