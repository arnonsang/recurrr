import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import {
	getSubscriptionById,
	updateSubscription,
	type UpdateSubscriptionData
} from '$lib/server/subscription';
import { getCategories } from '$lib/server/category';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(302, '/demo/lucia/login');
	}

	const subscription = await getSubscriptionById(params.id);
	if (!subscription) {
		throw redirect(302, '/subscriptions');
	}

	// Check if subscription belongs to user
	if (subscription.userId !== locals.user.id) {
		throw redirect(302, '/subscriptions');
	}

	const categories = await getCategories();
	const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'THB'];

	return {
		subscription,
		categories,
		currencies
	};
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		if (!locals.user) {
			throw redirect(302, '//login');
		}

		const subscription = await getSubscriptionById(params.id);
		if (!subscription || subscription.userId !== locals.user.id) {
			throw redirect(302, '/subscriptions');
		}

		const data = await request.formData();
		const name = (data.get('name') as string) || '';
		const price = parseFloat((data.get('price') as string) || '0');
		const currency = (data.get('currency') as string) || '';
		const paymentDay = parseInt((data.get('paymentDay') as string) || '1');
		const paymentMonth = parseInt((data.get('paymentMonth') as string) || '1');
		const nextPayment = new Date((data.get('nextPayment') as string) || '');
		const categoryId = (data.get('categoryId') as string) || '';
		const logo = (data.get('logo') as string) || '';
		const link = (data.get('link') as string) || '';
		const notes = (data.get('notes') as string) || '';
		const paidBy = (data.get('paidBy') as string) || '';
		const paymentMethod = (data.get('paymentMethod') as string) || '';
		const disabled = data.get('disabled') === 'on';

		// Validation
		const errors: Array<{ field: string; message: string }> = [];

		if (!name || name.trim().length === 0) {
			errors.push({ field: 'name', message: 'Name is required' });
		}

		if (isNaN(price) || price <= 0) {
			errors.push({ field: 'price', message: 'Price must be a positive number' });
		}

		if (!currency) {
			errors.push({ field: 'currency', message: 'Currency is required' });
		}

		if (isNaN(paymentDay) || paymentDay < 1 || paymentDay > 31) {
			errors.push({ field: 'paymentDay', message: 'Payment day must be between 1 and 31' });
		}

		if (isNaN(paymentMonth) || paymentMonth < 1) {
			errors.push({ field: 'paymentMonth', message: 'Payment frequency is required' });
		}

		if (isNaN(nextPayment.getTime())) {
			errors.push({ field: 'nextPayment', message: 'Valid next payment date is required' });
		}

		if (link && link.trim().length > 0) {
			try {
				new URL(link.trim());
			} catch {
				errors.push({ field: 'link', message: 'Invalid URL format' });
			}
		}

		if (logo && logo.trim().length > 0) {
			try {
				new URL(logo.trim());
			} catch {
				errors.push({ field: 'logo', message: 'Invalid URL format' });
			}
		}

		if (errors.length > 0) {
			return fail(400, {
				errors,
				values: {
					name,
					price: price.toString(),
					currency,
					paymentDay: paymentDay.toString(),
					paymentMonth: paymentMonth.toString(),
					nextPayment: data.get('nextPayment') as string,
					categoryId: categoryId || null,
					logo: logo || null,
					link: link || null,
					notes: notes || null,
					paidBy: paidBy || null,
					paymentMethod: paymentMethod || null,
					disabled
				}
			});
		}

		try {
			const updateData: UpdateSubscriptionData = {
				name: name.trim(),
				price,
				currency,
				paymentEvery: {
					day: paymentDay,
					month: paymentMonth
				},
				nextPayment,
				categoryId: categoryId && categoryId.trim() ? categoryId : undefined,
				logo: logo && logo.trim() ? logo.trim() : undefined,
				link: link && link.trim() ? link.trim() : undefined,
				notes: notes && notes.trim() ? notes.trim() : undefined,
				paidBy: paidBy && paidBy.trim() ? paidBy.trim() : undefined,
				paymentMethod: paymentMethod && paymentMethod.trim() ? paymentMethod.trim() : undefined,
				disabled
			};

			await updateSubscription(subscription.id, locals.user.id, updateData);
		} catch (error) {
			console.error('Failed to update subscription:', error);
			return fail(500, {
				errors: [{ field: 'general', message: 'Failed to update subscription. Please try again.' }]
			});
		}

		throw redirect(302, `/subscriptions/${subscription.id}`);
	}
};
