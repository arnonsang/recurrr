<script lang="ts">
	import type { SubscriptionWithCategory } from '$lib/server/subscription';
	import { createEventDispatcher } from 'svelte';

	interface Props {
		subscription: SubscriptionWithCategory;
	}

	let { subscription }: Props = $props();

	const dispatch = createEventDispatcher<{
		delete: { subscription: SubscriptionWithCategory };
	}>();

	function formatCurrency(amount: number, currency: string): string {
		try {
			return new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: currency
			}).format(amount);
		} catch {
			return `${amount.toFixed(2)} ${currency}`;
		}
	}

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString();
	}

	function getPaymentFrequency(paymentEvery: { day: number; month: number }): string {
		if (paymentEvery.month === 1) return 'Monthly';
		if (paymentEvery.month === 3) return 'Quarterly';
		if (paymentEvery.month === 6) return 'Semi-annually';
		if (paymentEvery.month === 12) return 'Annually';
		return `Every ${paymentEvery.month} months`;
	}

	function handleDelete() {
		dispatch('delete', { subscription });
	}
</script>

<div class="card bg-base-100 border-base-300 border shadow-sm transition-shadow hover:shadow-md">
	<div class="card-body p-4">
		<!-- Header with logo and name -->
		<div class="mb-3 flex items-start justify-between gap-3">
			<div class="flex min-w-0 flex-1 items-center gap-3">
				<div class="avatar flex-shrink-0">
					<div class="mask mask-squircle h-12 w-12">
						{#if subscription.logo}
							<img src={subscription.logo} alt={subscription.name} class="object-cover" />
						{:else}
							<div
								class="bg-neutral text-neutral-content flex h-full w-full items-center justify-center"
							>
								<span class="text-lg font-bold">
									{subscription.name.charAt(0).toUpperCase()}
								</span>
							</div>
						{/if}
					</div>
				</div>

				<div class="min-w-0 flex-1">
					<h3 class="truncate text-lg font-bold">{subscription.name}</h3>
					{#if subscription.paidBy}
						<p class="truncate text-sm opacity-60">Paid by {subscription.paidBy}</p>
					{/if}
				</div>
			</div>

			<!-- Status badge -->
			<div class="flex-shrink-0">
				{#if subscription.disabled}
					<div class="badge badge-error badge-outline">Disabled</div>
				{:else}
					<div class="badge badge-success badge-outline">Active</div>
				{/if}
			</div>
		</div>

		<!-- Price and frequency -->
		<div class="mb-3 flex items-center justify-between">
			<div>
				<div class="font-mono text-2xl font-bold">
					{formatCurrency(subscription.price, subscription.currency)}
				</div>
				<div class="badge badge-ghost badge-sm">
					{getPaymentFrequency(subscription.paymentEvery)}
				</div>
			</div>
			<div class="text-right">
				<div class="text-sm opacity-70">Next payment</div>
				<div class="font-medium">{formatDate(subscription.nextPayment)}</div>
			</div>
		</div>

		<!-- Category -->
		{#if subscription.category}
			<div class="mb-3">
				<div class="badge badge-outline">
					{subscription.category.name}
				</div>
			</div>
		{:else}
			<div class="mb-3">
				<span class="text-base-content/50 text-sm">Uncategorized</span>
			</div>
		{/if}

		<!-- Actions -->
		<div class="card-actions border-base-300 justify-end border-t pt-3">
			<div class="flex gap-2">
				<a
					href="/subscriptions/{subscription.id}"
					class="btn btn-ghost btn-sm"
					aria-label="View {subscription.name} details"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						></path>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
						></path>
					</svg>
					View
				</a>
				<a
					href="/subscriptions/{subscription.id}/edit"
					class="btn btn-ghost btn-sm"
					aria-label="Edit {subscription.name}"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
						></path>
					</svg>
					Edit
				</a>
				<button
					class="btn btn-ghost btn-sm text-error"
					onclick={handleDelete}
					aria-label="Delete {subscription.name}"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						></path>
					</svg>
					Delete
				</button>
			</div>
		</div>
	</div>
</div>
