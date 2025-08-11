<script lang="ts">
	import type { PageData } from './$types';
	import SubscriptionCard from '$lib/components/SubscriptionCard.svelte';
	import CurrencyDisplay from '$lib/components/CurrencyDisplay.svelte';
	import PaymentCalendar from '$lib/components/PaymentCalendar.svelte';

	export let data: PageData;

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
</script>

<svelte:head>
	<title>Dashboard - Recurrr</title>
</svelte:head>

<div class="container mx-auto space-y-6 p-4">
	<!-- Header -->
	<div class="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
		<div>
			<h1 class="text-3xl font-bold">Dashboard</h1>
			<p class="text-base-content/70 mt-1">Overview of your subscription spending</p>
		</div>
		<a href="/subscriptions/add" class="btn btn-primary">
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 6v6m0 0v6m0-6h6m-6 0H6"
				></path>
			</svg>
			Add Subscription
		</a>
	</div>

	<!-- Stats Grid -->
	<div class="stats stats-vertical lg:stats-horizontal bg-base-100 w-full shadow">
		<div class="stat">
			<div class="stat-figure text-primary">
				<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					>
					</path>
				</svg>
			</div>
			<div class="stat-title">Total Subscriptions</div>
			<div class="stat-value text-primary">{data.stats.totalSubscriptions}</div>
		</div>

		<div class="stat">
			<div class="stat-figure text-secondary">
				<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
					>
					</path>
				</svg>
			</div>
			<div class="stat-title">Monthly Total</div>
			<div class="stat-value text-secondary">
				<CurrencyDisplay amount={data.stats.monthlyTotal} currency="THB" showOriginal={false} />
			</div>
		</div>

		<div class="stat">
			<div class="stat-figure text-accent">
				<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					>
					</path>
				</svg>
			</div>
			<div class="stat-title">Upcoming (30 days)</div>
			<div class="stat-value text-accent">{data.stats.upcomingCount}</div>
		</div>

		<div class="stat">
			<div class="stat-figure text-warning">
				<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
					>
					</path>
				</svg>
			</div>
			<div class="stat-title">Due Soon (7 days)</div>
			<div class="stat-value text-warning">{data.stats.urgentCount}</div>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Spending by Category -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title">Spending by Category</h2>
				{#if Object.keys(data.totalsByCategory).length > 0}
					<div class="space-y-4">
						{#each Object.entries(data.totalsByCategory) as [categoryName, total]}
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium">{categoryName}</span>
								<span class="text-sm opacity-70">
									<CurrencyDisplay amount={total} currency="THB" showOriginal={false} />
								</span>
							</div>
							<progress
								class="progress progress-primary"
								value={total}
								max={data.stats.monthlyTotal}
							></progress>
						{/each}
					</div>
				{:else}
					<p class="text-sm opacity-70">No categories with spending yet.</p>
				{/if}
			</div>
		</div>

		<!-- Currency Breakdown -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title">Currency Breakdown</h2>
				{#if Object.keys(data.stats.currencyTotals).length > 0}
					<div class="space-y-3">
						{#each Object.entries(data.stats.currencyTotals) as [currency, total]}
							<div class="flex items-center justify-between">
								<div class="badge badge-outline">{currency}</div>
								<span class="font-mono font-semibold">
									{formatCurrency(total, currency)}
								</span>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm opacity-70">No subscriptions yet.</p>
				{/if}
			</div>
		</div>

		<!-- Quick Stats -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title">Quick Stats</h2>
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-sm opacity-70">Active Subscriptions</span>
						<span class="font-semibold">{data.stats.activeSubscriptions}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm opacity-70">Monthly Total</span>
						<span class="font-semibold">
							<CurrencyDisplay
								amount={data.stats.monthlyTotal}
								currency="THB"
								showOriginal={false}
							/>
						</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm opacity-70">Yearly Projection</span>
						<span class="font-semibold">
							<CurrencyDisplay
								amount={data.stats.yearlyTotal}
								currency="THB"
								showOriginal={false}
							/>
						</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm opacity-70">Avg per Subscription</span>
						<span class="font-semibold">
							<CurrencyDisplay
								amount={data.stats.activeSubscriptions > 0
									? data.stats.monthlyTotal / data.stats.activeSubscriptions
									: 0}
								currency="THB"
								showOriginal={false}
							/>
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Payment Calendar -->
	<div class="mb-8">
		<PaymentCalendar subscriptions={data.subscriptions} />
	</div>

	<!-- Urgent Payments -->
	{#if data.urgentPayments.length > 0}
		<div class="alert alert-warning mb-8 shadow-lg">
			<svg class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
				>
				</path>
			</svg>
			<div class="w-full">
				<h3 class="font-bold">Payments Due Soon</h3>
				<div class="mb-4 text-xs opacity-70">
					You have {data.urgentPayments.length} payment{data.urgentPayments.length === 1 ? '' : 's'}
					due within 7 days
				</div>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each data.urgentPayments as subscription}
						<SubscriptionCard {subscription} showCategory={false} />
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- Recent Subscriptions -->
	{#if data.subscriptions.length > 0}
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="card-title">Recent Subscriptions</h2>
					<a href="/subscriptions" class="link link-primary"> View all → </a>
				</div>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each data.subscriptions.slice(0, 6) as subscription}
						<SubscriptionCard {subscription} />
					{/each}
				</div>
			</div>
		</div>
	{:else}
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body py-12 text-center">
				<svg
					class="text-base-content/30 mx-auto mb-4 h-16 w-16"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					>
					</path>
				</svg>
				<h3 class="mb-2 text-xl font-semibold">No subscriptions yet</h3>
				<p class="text-base-content/70 mb-6">
					Get started by adding your first subscription to track your spending.
				</p>
				<a href="/subscriptions/add" class="btn btn-primary">
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 6v6m0 0v6m0-6h6m-6 0H6"
						></path>
					</svg>
					Add Your First Subscription
				</a>
			</div>
		</div>
	{/if}
</div>
