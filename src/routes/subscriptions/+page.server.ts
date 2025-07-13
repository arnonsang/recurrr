import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getSubscriptions } from '$lib/server/subscription';
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

		const [subscriptions, categories] = await Promise.all([
			getSubscriptions(locals.user.id, filters, sort),
			getCategories()
		]);

		return {
			subscriptions,
			categories,
			filters,
			sort
		};
	} catch (error) {
		console.error('Error loading subscriptions:', error);
		return {
			subscriptions: [],
			categories: [],
			filters: {},
			sort: { field: 'nextPayment', direction: 'asc' }
		};
	}
};
