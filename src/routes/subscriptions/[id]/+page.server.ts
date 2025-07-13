import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getSubscription } from '$lib/server/subscription';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	try {
		const subscription = await getSubscription(params.id, locals.user.id);

		if (!subscription) {
			throw error(404, { message: 'Subscription not found' });
		}

		return {
			subscription
		};
	} catch (err) {
		if (err instanceof Response) throw err;
		console.error('Error loading subscription:', err);
		throw error(500, { message: 'Internal server error' });
	}
};
