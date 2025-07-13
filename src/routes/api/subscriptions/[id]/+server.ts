import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSubscription, updateSubscription, deleteSubscription } from '$lib/server/subscription';
import { validateSubscriptionData } from '$lib/server/validation';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return error(401, { message: 'Unauthorized' });
	}

	try {
		const subscription = await getSubscription(params.id, locals.user.id);

		if (!subscription) {
			return error(404, { message: 'Subscription not found' });
		}

		return json({
			success: true,
			data: subscription
		});
	} catch (err) {
		console.error('Error fetching subscription:', err);
		return error(500, { message: 'Internal server error' });
	}
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
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

		const subscription = await updateSubscription(params.id, locals.user.id, validation.data);

		if (!subscription) {
			return error(404, { message: 'Subscription not found' });
		}

		return json({
			success: true,
			data: subscription
		});
	} catch (err) {
		console.error('Error updating subscription:', err);
		return error(500, { message: 'Internal server error' });
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return error(401, { message: 'Unauthorized' });
	}

	try {
		const deleted = await deleteSubscription(params.id, locals.user.id);

		if (!deleted) {
			return error(404, { message: 'Subscription not found' });
		}

		return json({
			success: true,
			message: 'Subscription deleted successfully'
		});
	} catch (err) {
		console.error('Error deleting subscription:', err);
		return error(500, { message: 'Internal server error' });
	}
};
