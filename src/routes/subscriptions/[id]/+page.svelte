<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	$: subscription = data.subscription;

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
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function getPaymentFrequency(paymentEvery: { day: number; month: number }): string {
		if (paymentEvery.month === 1) return 'Monthly';
		if (paymentEvery.month === 3) return 'Quarterly';
		if (paymentEvery.month === 6) return 'Semi-annually';
		if (paymentEvery.month === 12) return 'Annually';
		return `Every ${paymentEvery.month} months`;
	}

	function calculateMonthlyEquivalent(
		price: number,
		paymentEvery: { day: number; month: number }
	): string {
		const monthly = price / paymentEvery.month;
		return formatCurrency(monthly, subscription.currency);
	}
</script>

<svelte:head>
	<title>{subscription.name} - Recurrr</title>
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<!-- Breadcrumb -->
	<div class="breadcrumbs mb-8 text-sm">
		<ul>
			<li><a href="/subscriptions" class="link link-hover">Subscriptions</a></li>
			<li>{subscription.name}</li>
		</ul>
	</div>

	<!-- Header -->
	<div class="card bg-base-100 mb-8 shadow-md">
		<div class="card-body p-6">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					{#if subscription.logo}
						<div class="avatar">
							<div class="h-16 w-16 rounded-full">
								<img src={subscription.logo} alt={subscription.name} />
							</div>
						</div>
					{:else}
						<div class="avatar placeholder">
							<div class="bg-neutral text-neutral-content h-16 w-16 rounded-full">
								<span class="text-xl">{subscription.name.charAt(0).toUpperCase()}</span>
							</div>
						</div>
					{/if}
					<div>
						<h1 class="text-2xl font-bold">{subscription.name}</h1>
						<div class="mt-1 flex items-center gap-3">
							<div class="badge {subscription.disabled ? 'badge-error' : 'badge-success'}">
								{subscription.disabled ? 'Inactive' : 'Active'}
							</div>
							{#if subscription.category}
								<span class="text-sm opacity-70">{subscription.category.name}</span>
							{/if}
						</div>
					</div>
				</div>
				<div class="flex gap-3">
					<a href="/subscriptions/{subscription.id}/edit" class="btn btn-primary"> Edit </a>
					{#if subscription.link}
						<a
							href={subscription.link}
							target="_blank"
							rel="noopener noreferrer"
							class="btn btn-outline"
						>
							View Account
						</a>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<!-- Main Details -->
		<div class="space-y-6 lg:col-span-2">
			<!-- Pricing Information -->
			<div class="card bg-base-100 shadow-md">
				<div class="card-body">
					<h2 class="card-title">Pricing Information</h2>
					<div class="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
						<div>
							<div class="mb-1 text-sm opacity-70">
								Price per {getPaymentFrequency(subscription.paymentEvery).toLowerCase()}
							</div>
							<div class="text-2xl font-semibold">
								{formatCurrency(subscription.price, subscription.currency)}
							</div>
						</div>
						<div>
							<div class="mb-1 text-sm opacity-70">Monthly Equivalent</div>
							<div class="text-2xl font-semibold opacity-80">
								{calculateMonthlyEquivalent(subscription.price, subscription.paymentEvery)}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Payment Schedule -->
			<div class="card bg-base-100 shadow-md">
				<div class="card-body">
					<h2 class="card-title">Payment Schedule</h2>
					<div class="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
						<div>
							<div class="mb-1 text-sm opacity-70">Frequency</div>
							<div class="text-lg">{getPaymentFrequency(subscription.paymentEvery)}</div>
							<div class="text-sm opacity-70">
								On day {subscription.paymentEvery.day} every {subscription.paymentEvery.month} month(s)
							</div>
						</div>
						<div>
							<div class="mb-1 text-sm opacity-70">Next Payment</div>
							<div class="text-lg">{formatDate(subscription.nextPayment)}</div>
							{#if new Date(subscription.nextPayment) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
								<div class="text-warning text-sm font-medium">Due within 7 days</div>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Notes -->
			{#if subscription.notes}
				<div class="card bg-base-100 shadow-md">
					<div class="card-body">
						<h2 class="card-title">Notes</h2>
						<div class="prose prose-sm mt-4 max-w-none">
							<p class="whitespace-pre-wrap opacity-80">{subscription.notes}</p>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Quick Details -->
			<div class="card bg-base-100 shadow-md">
				<div class="card-body">
					<h2 class="card-title">Details</h2>
					<div class="mt-4 space-y-4">
						{#if subscription.paidBy}
							<div>
								<div class="text-sm opacity-70">Paid By</div>
								<div class="text-sm">{subscription.paidBy}</div>
							</div>
						{/if}
						{#if subscription.paymentMethod}
							<div>
								<div class="text-sm opacity-70">Payment Method</div>
								<div class="text-sm">{subscription.paymentMethod}</div>
							</div>
						{/if}
						<div>
							<div class="text-sm opacity-70">Currency</div>
							<div class="text-sm">{subscription.currency}</div>
						</div>
						<div>
							<div class="text-sm opacity-70">Created</div>
							<div class="text-sm">{formatDate(subscription.createdAt)}</div>
						</div>
						<div>
							<div class="text-sm opacity-70">Last Updated</div>
							<div class="text-sm">{formatDate(subscription.updatedAt)}</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="card bg-base-100 shadow-md">
				<div class="card-body">
					<h2 class="card-title">Quick Actions</h2>
					<div class="mt-4 space-y-3">
						<a href="/subscriptions/{subscription.id}/edit" class="btn btn-primary w-full">
							Edit Subscription
						</a>
						{#if subscription.link}
							<a
								href={subscription.link}
								target="_blank"
								rel="noopener noreferrer"
								class="btn btn-outline w-full"
							>
								Manage Account
							</a>
						{/if}
						<button
							type="button"
							class="btn btn-error w-full"
							on:click={() => {
								if (confirm('Are you sure you want to delete this subscription?')) {
									// TODO: Implement delete functionality
									alert('Delete functionality will be implemented');
								}
							}}
						>
							Delete Subscription
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
