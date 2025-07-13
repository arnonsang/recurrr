import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCategories, createCategory } from '$lib/server/category';
import { validateCategoryData } from '$lib/server/validation';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return error(401, { message: 'Unauthorized' });
	}

	try {
		const categories = await getCategories();

		return json({
			success: true,
			data: categories,
			count: categories.length
		});
	} catch (err) {
		console.error('Error fetching categories:', err);
		return error(500, { message: 'Internal server error' });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return error(401, { message: 'Unauthorized' });
	}

	try {
		const body = await request.json();

		// Validate the category data
		const validation = validateCategoryData(body);

		if (!validation.success) {
			return json(
				{
					success: false,
					errors: validation.errors
				},
				{ status: 400 }
			);
		}

		const category = await createCategory(validation.data);

		return json(
			{
				success: true,
				data: category
			},
			{ status: 201 }
		);
	} catch (err) {
		console.error('Error creating category:', err);
		return error(500, { message: 'Internal server error' });
	}
};
