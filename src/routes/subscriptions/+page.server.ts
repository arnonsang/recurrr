import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getSubscriptionsPaginated } from '$lib/server/subscription';
import { getCategories } from '$lib/server/category';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	try {
		// Parse query parameters for filtering
		const categoryId = url.searchParams.get('categoryId') || undefined;
		const disabled = url.searchParams.get('disabled');
		const currency = url.searchParams.get('currency') || undefined;
		const paidBy = url.searchParams.get('paidBy') || undefined;
		const sortField =
			(url.searchParams.get('sortField') as 'name' | 'price' | 'nextPayment' | 'createdAt') ||
			'nextPayment';
		const sortDirection = (url.searchParams.get('sortDirection') as 'asc' | 'desc') || 'asc';

		// Parse pagination parameters
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '25');

		const filters = {
			categoryId,
			disabled: disabled !== null ? disabled === 'true' : undefined,
			currency,
			paidBy
		};

		const sort = {
			field: sortField,
			direction: sortDirection
		};

		const pagination = { page, limit };

		const [result, categories] = await Promise.all([
			getSubscriptionsPaginated(locals.user.id, filters, sort, pagination),
			getCategories()
		]);

		return {
			subscriptions: result.data,
			pagination: result.pagination,
			categories,
			filters,
			sort
		};
	} catch (error) {
		console.error('Error loading subscriptions:', error);
		return {
			subscriptions: [],
			pagination: {
				page: 1,
				limit: 25,
				total: 0,
				totalPages: 0,
				hasNext: false,
				hasPrev: false
			},
			categories: [],
			filters: {},
			sort: { field: 'nextPayment', direction: 'asc' }
		};
	}
};
