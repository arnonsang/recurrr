<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	let searchTerm = '';
	let selectedCategory = '';
	let selectedCurrency = '';
	let selectedPaidBy = '';
	let showDisabled = false;
	let sortBy = 'nextPayment';
	let sortOrder = 'asc';

	$: sortedAndFilteredSubscriptions = data.subscriptions
		.filter((subscription) => {
			if (searchTerm && !subscription.name.toLowerCase().includes(searchTerm.toLowerCase())) {
				return false;
			}
			if (selectedCategory && subscription.categoryId !== selectedCategory) {
				return false;
			}
			if (selectedCurrency && subscription.currency !== selectedCurrency) {
				return false;
			}
			if (selectedPaidBy && subscription.paidBy !== selectedPaidBy) {
				return false;
			}
			if (!showDisabled && subscription.disabled) {
				return false;
			}
			return true;
		})
		.sort((a, b) => {
			let aVal, bVal;
			switch (sortBy) {
				case 'name':
					aVal = a.name.toLowerCase();
					bVal = b.name.toLowerCase();
					break;
				case 'price':
					aVal = a.price;
					bVal = b.price;
					break;
				case 'nextPayment':
					aVal = new Date(a.nextPayment);
					bVal = new Date(b.nextPayment);
					break;
				case 'category':
					aVal = a.category?.name || 'zzz';
					bVal = b.category?.name || 'zzz';
					break;
				default:
					return 0;
			}

			if (sortOrder === 'asc') {
				return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			} else {
				return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
			}
		});

	$: totalMonthly = sortedAndFilteredSubscriptions.reduce((sum, sub) => {
		if (sub.disabled) return sum;
		// Simple monthly calculation - could be enhanced with proper conversion
		const monthly = sub.price / sub.paymentEvery.month;
		return sum + monthly;
	}, 0);

	$: uniqueCurrencies = [...new Set(data.subscriptions.map((s) => s.currency))];
	$: uniquePaidBy = [...new Set(data.subscriptions.map((s) => s.paidBy).filter(Boolean))];

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

	function handleSort(field: string) {
		if (sortBy === field) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = field;
			sortOrder = 'asc';
		}
	}
</script>

<svelte:head>
	<title>Subscriptions - Recurrr</title>
</svelte:head>

<div class="container mx-auto space-y-6 p-4">
	<!-- Header -->
	<div class="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
		<div>
			<h1 class="text-3xl font-bold">Subscriptions</h1>
			<p class="text-base-content/70 mt-1">Manage your recurring subscriptions</p>
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

	<!-- Summary Stats -->
	<div class="stats stats-vertical lg:stats-horizontal w-full shadow bg-base-100">
		<div class="stat">
			<div class="stat-figure text-primary">
				<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
					></path>
				</svg>
			</div>
			<div class="stat-title">Total Subscriptions</div>
			<div class="stat-value text-primary">{sortedAndFilteredSubscriptions.length}</div>
		</div>

		<div class="stat">
			<div class="stat-figure text-secondary">
				<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
					></path>
				</svg>
			</div>
			<div class="stat-title">Monthly Total</div>
			<div class="stat-value text-secondary">{formatCurrency(totalMonthly, 'THB')}</div>
		</div>

		<div class="stat">
			<div class="stat-figure text-accent">
				<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					></path>
				</svg>
			</div>
			<div class="stat-title">Active</div>
			<div class="stat-value text-accent">
				{sortedAndFilteredSubscriptions.filter((s) => !s.disabled).length}
			</div>
		</div>
	</div>

	<!-- Filters -->
	<div class="card bg-base-100 shadow-lg">
		<div class="card-body">
			<h3 class="card-title mb-4">
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
					></path>
				</svg>
				Filters & Search
			</h3>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
				<div class="form-control">
					<label class="label" for="search">
						<span class="label-text">Search</span>
					</label>
					<div class="relative">
						<input
							id="search"
							type="text"
							bind:value={searchTerm}
							placeholder="Search subscriptions..."
							class="input input-bordered w-full pr-10"
						/>
						<svg
							class="text-base-content/50 absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							></path>
						</svg>
					</div>
				</div>

				<div class="form-control">
					<label class="label" for="category">
						<span class="label-text">Category</span>
					</label>
					<select id="category" bind:value={selectedCategory} class="select select-bordered w-full">
						<option value="">All Categories</option>
						{#each data.categories as category}
							<option value={category.id}>{category.name}</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label class="label" for="currency">
						<span class="label-text">Currency</span>
					</label>
					<select id="currency" bind:value={selectedCurrency} class="select select-bordered w-full">
						<option value="">All Currencies</option>
						{#each uniqueCurrencies as currency}
							<option value={currency}>{currency}</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label class="label" for="paidBy">
						<span class="label-text">Paid By</span>
					</label>
					<select id="paidBy" bind:value={selectedPaidBy} class="select select-bordered w-full">
						<option value="">All</option>
						{#each uniquePaidBy as paidBy}
							<option value={paidBy}>{paidBy}</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer">
						<span class="label-text">Show disabled</span>
						<input type="checkbox" bind:checked={showDisabled} class="toggle toggle-primary" />
					</label>
				</div>
			</div>

			<!-- Quick Filter Buttons -->
			<div class="card-actions justify-end">
				<button
					class="btn btn-outline btn-sm"
					onclick={() => {
						searchTerm = '';
						selectedCategory = '';
						selectedCurrency = '';
						selectedPaidBy = '';
						showDisabled = false;
					}}
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
						></path>
					</svg>
					Clear Filters
				</button>
			</div>
		</div>

		<!-- Subscriptions List -->
		<div class="card bg-base-100 shadow-lg">
			{#if sortedAndFilteredSubscriptions.length === 0}
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
					<h3 class="mb-2 text-xl font-semibold">No subscriptions found</h3>
					<p class="text-base-content/70 mb-6">
						{#if searchTerm || selectedCategory || selectedCurrency || selectedPaidBy}
							Try adjusting your filters or search terms.
						{:else}
							Get started by adding your first subscription.
						{/if}
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
			{:else}
				<div class="overflow-x-auto">
					<table class="table-zebra table">
						<thead>
							<tr>
								<th>
									<button
										class="btn btn-ghost btn-sm justify-start"
										onclick={() => handleSort('name')}
									>
										Service
										{#if sortBy === 'name'}
											<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												{#if sortOrder === 'asc'}
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M5 15l7-7 7 7"
													></path>
												{:else}
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 9l-7 7-7-7"
													></path>
												{/if}
											</svg>
										{/if}
									</button>
								</th>
								<th>
									<button
										class="btn btn-ghost btn-sm justify-start"
										onclick={() => handleSort('price')}
									>
										Price
										{#if sortBy === 'price'}
											<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												{#if sortOrder === 'asc'}
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M5 15l7-7 7 7"
													></path>
												{:else}
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 9l-7 7-7-7"
													></path>
												{/if}
											</svg>
										{/if}
									</button>
								</th>
								<th>Frequency</th>
								<th>
									<button
										class="btn btn-ghost btn-sm justify-start"
										onclick={() => handleSort('nextPayment')}
									>
										Next Payment
										{#if sortBy === 'nextPayment'}
											<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												{#if sortOrder === 'asc'}
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M5 15l7-7 7 7"
													></path>
												{:else}
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 9l-7 7-7-7"
													></path>
												{/if}
											</svg>
										{/if}
									</button>
								</th>
								<th>
									<button
										class="btn btn-ghost btn-sm justify-start"
										onclick={() => handleSort('category')}
									>
										Category
										{#if sortBy === 'category'}
											<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												{#if sortOrder === 'asc'}
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M5 15l7-7 7 7"
													></path>
												{:else}
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 9l-7 7-7-7"
													></path>
												{/if}
											</svg>
										{/if}
									</button>
								</th>
								<th>Status</th>
								<th class="text-right">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each sortedAndFilteredSubscriptions as subscription}
								<tr>
									<td>
										<div class="flex items-center gap-3">
											<div class="avatar">
												<div class="mask mask-squircle h-12 w-12">
													{#if subscription.logo}
														<img src={subscription.logo} alt={subscription.name} />
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
											<div>
												<div class="font-bold">{subscription.name}</div>
												{#if subscription.paidBy}
													<div class="text-sm opacity-50">Paid by {subscription.paidBy}</div>
												{/if}
											</div>
										</div>
									</td>
									<td class="font-mono font-semibold">
										{formatCurrency(subscription.price, subscription.currency)}
									</td>
									<td>
										<div class="badge badge-ghost badge-sm">
											{getPaymentFrequency(subscription.paymentEvery)}
										</div>
									</td>
									<td>
										{formatDate(subscription.nextPayment)}
									</td>
									<td>
										{#if subscription.category}
											<div class="badge badge-outline">
												{subscription.category.name}
											</div>
										{:else}
											<span class="text-base-content/50">Uncategorized</span>
										{/if}
									</td>
									<td>
										{#if subscription.disabled}
											<div class="badge badge-error badge-outline">Disabled</div>
										{:else}
											<div class="badge badge-success badge-outline">Active</div>
										{/if}
									</td>
									<td class="text-right">
										<div class="flex justify-end gap-1">
											<a
												href="/subscriptions/{subscription.id}"
												class="btn btn-ghost btn-xs"
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
											</a>
											<a
												href="/subscriptions/{subscription.id}/edit"
												class="btn btn-ghost btn-xs"
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
											</a>
											<button
												class="btn btn-ghost btn-xs text-error"
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
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>
</div>
