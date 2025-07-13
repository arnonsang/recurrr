<script lang="ts">
	import CurrencyDisplay from './CurrencyDisplay.svelte';
	import type { SubscriptionWithCategory } from '$lib/server/subscription';

	export let subscription: SubscriptionWithCategory;
	export let showCategory: boolean = true;
	export let showActions: boolean = true;

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function getPaymentFrequency(paymentEvery: { day: number; month: number }): string {
		if (paymentEvery.month === 1) return 'Monthly';
		if (paymentEvery.month === 3) return 'Quarterly';
		if (paymentEvery.month === 6) return 'Semi-annually';
		if (paymentEvery.month === 12) return 'Annually';
		return `Every ${paymentEvery.month}mo`;
	}

	function getDaysUntilPayment(nextPayment: Date): number {
		const now = new Date();
		const payment = new Date(nextPayment);
		const diffTime = payment.getTime() - now.getTime();
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	}

	$: daysUntil = getDaysUntilPayment(subscription.nextPayment);
	$: isUpcoming = daysUntil <= 7 && daysUntil >= 0;
	$: isOverdue = daysUntil < 0;
</script>

<div class="card bg-base-100 border-base-200 border shadow-md transition-shadow hover:shadow-lg">
	<div class="card-body p-6">
		<!-- Header -->
		<div class="mb-4 flex items-center justify-between">
			<div class="flex items-center gap-3">
				{#if subscription.logo}
					<div class="avatar">
						<div class="h-10 w-10 rounded-full">
							<img
								src={subscription.logo}
								alt={subscription.name}
								on:error={(e) => {
									const target = e.currentTarget as HTMLImageElement;
									const fallback = target.parentElement?.nextElementSibling as HTMLElement;
									if (target && fallback) {
										target.parentElement?.classList.add('hidden');
										fallback.classList.remove('hidden');
									}
								}}
							/>
						</div>
					</div>
					<div class="avatar placeholder hidden">
						<div class="bg-neutral text-neutral-content h-10 w-10 rounded-full">
							<span class="text-sm">{subscription.name.charAt(0).toUpperCase()}</span>
						</div>
					</div>
				{:else}
					<div class="avatar placeholder">
						<div class="bg-neutral text-neutral-content h-10 w-10 rounded-full">
							<span class="text-sm">{subscription.name.charAt(0).toUpperCase()}</span>
						</div>
					</div>
				{/if}

				<div class="min-w-0 flex-1">
					<h3 class="card-title text-lg">{subscription.name}</h3>
					{#if showCategory && subscription.category}
						<p class="text-sm opacity-70">{subscription.category.name}</p>
					{:else if subscription.paidBy}
						<p class="text-sm opacity-70">Paid by {subscription.paidBy}</p>
					{/if}
				</div>
			</div>

			<div class="badge {subscription.disabled ? 'badge-error' : 'badge-success'} badge-sm">
				{subscription.disabled ? 'Inactive' : 'Active'}
			</div>
		</div>

		<!-- Price and Payment Info -->
		<div class="mb-4 grid grid-cols-2 gap-4">
			<div class="space-y-1">
				<div class="text-xs font-medium tracking-wide uppercase opacity-60">Price</div>
				<div class="text-lg font-semibold">
					<CurrencyDisplay
						amount={subscription.price}
						currency={subscription.currency}
						showOriginal={false}
					/>
				</div>
				<div class="text-xs opacity-70">{getPaymentFrequency(subscription.paymentEvery)}</div>
			</div>

			<div class="space-y-1">
				<div class="text-xs font-medium tracking-wide uppercase opacity-60">Next Payment</div>
				<div
					class="text-sm font-medium {isOverdue ? 'text-error' : isUpcoming ? 'text-warning' : ''}"
				>
					{formatDate(subscription.nextPayment)}
				</div>
				<div
					class="text-xs {isOverdue ? 'text-error' : isUpcoming ? 'text-warning' : 'opacity-70'}"
				>
					{#if isOverdue}
						{Math.abs(daysUntil)} days overdue
					{:else if daysUntil === 0}
						Today
					{:else if daysUntil === 1}
						Tomorrow
					{:else}
						In {daysUntil} days
					{/if}
				</div>
			</div>
		</div>

		<!-- Notes Preview -->
		{#if subscription.notes}
			<div class="mb-4">
				<p class="line-clamp-2 text-sm opacity-80">
					{subscription.notes.length > 100
						? subscription.notes.substring(0, 100) + '...'
						: subscription.notes}
				</p>
			</div>
		{/if}

		<!-- Actions -->
		{#if showActions}
			<div class="divider my-2"></div>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					{#if subscription.link}
						<a
							href={subscription.link}
							target="_blank"
							rel="noopener noreferrer"
							class="link link-primary text-sm"
						>
							Account
						</a>
					{/if}
					{#if subscription.paymentMethod}
						<span class="text-sm opacity-70">{subscription.paymentMethod}</span>
					{/if}
				</div>

				<div class="flex gap-2">
					<a href="/subscriptions/{subscription.id}" class="btn btn-ghost btn-sm"> View </a>
					<a href="/subscriptions/{subscription.id}/edit" class="btn btn-primary btn-sm"> Edit </a>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		line-clamp: 2;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
