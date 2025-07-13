import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	getSubscriptions,
	getUpcomingSubscriptions,
	getTotalsByCategory
} from '$lib/server/subscription';
import { getCategories } from '$lib/server/category';
import { convertToDefaultCurrency } from '$lib/server/currency';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	try {
		const [allSubscriptions, upcomingSubscriptions, totalsByCategory, categories] =
			await Promise.all([
				getSubscriptions(locals.user.id, { disabled: false }),
				getUpcomingSubscriptions(locals.user.id, 30), // Next 30 days
				getTotalsByCategory(locals.user.id),
				getCategories()
			]);

		// Calculate totals
		const monthlyTotal = allSubscriptions.reduce((sum, sub) => {
			const monthlyAmount = sub.price / sub.paymentEvery.month;
			return sum + monthlyAmount;
		}, 0);

		const yearlyTotal = monthlyTotal * 12;

		// Get upcoming payments in next 7 days
		const urgentPayments = upcomingSubscriptions.filter((sub) => {
			const daysUntil = Math.ceil(
				(new Date(sub.nextPayment).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
			);
			return daysUntil <= 7;
		});

		// Calculate currency breakdown
		const currencyTotals = allSubscriptions.reduce(
			(acc, sub) => {
				const monthlyAmount = sub.price / sub.paymentEvery.month;
				acc[sub.currency] = (acc[sub.currency] || 0) + monthlyAmount;
				return acc;
			},
			{} as { [currency: string]: number }
		);

		return {
			subscriptions: allSubscriptions,
			upcomingSubscriptions,
			urgentPayments,
			totalsByCategory,
			categories,
			stats: {
				totalSubscriptions: allSubscriptions.length,
				activeSubscriptions: allSubscriptions.filter((s) => !s.disabled).length,
				monthlyTotal,
				yearlyTotal,
				currencyTotals,
				upcomingCount: upcomingSubscriptions.length,
				urgentCount: urgentPayments.length
			}
		};
	} catch (error) {
		console.error('Error loading dashboard:', error);
		return {
			subscriptions: [],
			upcomingSubscriptions: [],
			urgentPayments: [],
			totalsByCategory: {},
			categories: [],
			stats: {
				totalSubscriptions: 0,
				activeSubscriptions: 0,
				monthlyTotal: 0,
				yearlyTotal: 0,
				currencyTotals: {},
				upcomingCount: 0,
				urgentCount: 0
			}
		};
	}
};
