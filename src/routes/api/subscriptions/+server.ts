import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getSubscriptions,
	createSubscription,
	type SubscriptionFilters,
	type SubscriptionSort
} from '$lib/server/subscription';
import { validateSubscriptionData } from '$lib/server/validation';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		return error(401, { message: 'Unauthorized' });
	}

	try {
		// Parse query parameters for filtering and sorting
		const categoryId = url.searchParams.get('categoryId') || undefined;
		const disabled = url.searchParams.get('disabled');
		const currency = url.searchParams.get('currency') || undefined;
		const paidBy = url.searchParams.get('paidBy') || undefined;

		const sortField =
			(url.searchParams.get('sortField') as 'name' | 'price' | 'nextPayment' | 'createdAt') ||
			'nextPayment';
		const sortDirection = (url.searchParams.get('sortDirection') as 'asc' | 'desc') || 'asc';

		const filters: SubscriptionFilters = {
			categoryId,
			disabled: disabled !== null ? disabled === 'true' : undefined,
			currency,
			paidBy
		};

		const sort: SubscriptionSort = {
			field: sortField,
			direction: sortDirection
		};

		const subscriptions = await getSubscriptions(locals.user.id, filters, sort);

		return json({
			success: true,
			data: subscriptions,
			count: subscriptions.length
		});
	} catch (err) {
		console.error('Error fetching subscriptions:', err);
		return error(500, { message: 'Internal server error' });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return error(401, { message: 'Unauthorized' });
	}

	try {
		const body = await request.json();

		// Validate the subscription data
		const validation = validateSubscriptionData(body);

		if (!validation.success) {
			return json(
				{
					success: false,
					errors: validation.errors
				},
				{ status: 400 }
			);
		}

		const subscription = await createSubscription(locals.user.id, validation.data);

		return json(
			{
				success: true,
				data: subscription
			},
			{ status: 201 }
		);
	} catch (err) {
		console.error('Error creating subscription:', err);
		return error(500, { message: 'Internal server error' });
	}
};
