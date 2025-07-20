import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createSubscription } from '$lib/server/subscription';
import { getCategories } from '$lib/server/category';
import { validateSubscriptionData } from '$lib/server/validation';
import { getSupportedCurrencies } from '$lib/server/currency';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	try {
		const [categories, currencies] = await Promise.all([
			getCategories(),
			Promise.resolve(getSupportedCurrencies())
		]);

		return {
			categories,
			currencies
		};
	} catch (error) {
		console.error('Error loading add subscription page:', error);
		return {
			categories: [],
			currencies: getSupportedCurrencies()
		};
	}
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		let subscriptionData: any = {};

		try {
			const formData = await request.formData();

			subscriptionData = {
				name: formData.get('name') as string,
				logo: formData.get('logo') as string,
				price: formData.get('price') as string,
				currency: formData.get('currency') as string,
				paymentDay: formData.get('paymentDay') as string,
				paymentMonth: formData.get('paymentMonth') as string,
				nextPayment: formData.get('nextPayment') as string,
				paymentMethod: formData.get('paymentMethod') as string,
				categoryId: formData.get('categoryId') as string,
				paidBy: formData.get('paidBy') as string,
				link: formData.get('link') as string,
				notes: formData.get('notes') as string
			};

			// Validate the subscription data
			const validation = validateSubscriptionData(subscriptionData);

			if (!validation.success) {
				return fail(400, {
					errors: validation.errors,
					values: subscriptionData
				});
			}

			// Create the subscription
			await createSubscription(locals.user.id, validation.data);
		} catch (error) {
			if (error instanceof Response) throw error;

			console.error('Error creating subscription:', error);
			return fail(500, {
				errors: [
					{ field: 'general', message: 'An error occurred while creating the subscription' }
				],
				values: subscriptionData
			});
		}

		throw redirect(302, '/subscriptions');
	}
};
