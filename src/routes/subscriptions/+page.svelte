<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import DeleteConfirmModal from '$lib/components/DeleteConfirmModal.svelte';
	import SubscriptionListCard from '$lib/components/SubscriptionListCard.svelte';
	import type { SubscriptionWithCategory } from '$lib/server/subscription';

	export let data: PageData;

	let searchTerm = '';
	let selectedCategory = '';
	let selectedCurrency = '';
	let selectedPaidBy = '';
	let showDisabled = false;
	let sortBy = 'nextPayment';
	let sortOrder = 'asc';
	let viewMode = 'table'; // 'table' or 'list'
	let isDeleting = false;
	let deleteModalOpen = false;
	let subscriptionToDelete: SubscriptionWithCategory | null = null;
	let filtersCollapsed = false;

	// Client-side filtering of already paginated results for search
	$: filteredSubscriptions = data.subscriptions.filter((subscription) => {
		return !searchTerm || subscription.name.toLowerCase().includes(searchTerm.toLowerCase());
	});

	$: totalMonthly = filteredSubscriptions.reduce((sum, sub) => {
		if (sub.disabled) return sum;
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
		const url = new URL($page.url);
		url.searchParams.set('sortField', field);

		if (data.sort?.field === field) {
			url.searchParams.set('sortDirection', data.sort.direction === 'asc' ? 'desc' : 'asc');
		} else {
			url.searchParams.set('sortDirection', 'asc');
		}

		// Reset to first page when sorting
		url.searchParams.set('page', '1');
		goto(url.toString());
	}

	function applyFilters() {
		const url = new URL($page.url);

		if (selectedCategory) {
			url.searchParams.set('categoryId', selectedCategory);
		} else {
			url.searchParams.delete('categoryId');
		}

		if (selectedCurrency) {
			url.searchParams.set('currency', selectedCurrency);
		} else {
			url.searchParams.delete('currency');
		}

		if (selectedPaidBy) {
			url.searchParams.set('paidBy', selectedPaidBy);
		} else {
			url.searchParams.delete('paidBy');
		}

		if (showDisabled) {
			url.searchParams.set('disabled', 'true');
		} else {
			url.searchParams.delete('disabled');
		}

		// Reset to first page when filtering
		url.searchParams.set('page', '1');
		goto(url.toString());
	}

	function clearFilters() {
		const url = new URL($page.url);
		url.searchParams.delete('categoryId');
		url.searchParams.delete('currency');
		url.searchParams.delete('paidBy');
		url.searchParams.delete('disabled');
		url.searchParams.set('page', '1');

		// Reset local state
		selectedCategory = '';
		selectedCurrency = '';
		selectedPaidBy = '';
		showDisabled = false;

		goto(url.toString());
	}

	function changePage(newPage: number) {
		const url = new URL($page.url);
		url.searchParams.set('page', newPage.toString());
		goto(url.toString());
	}

	function changeLimit(newLimit: number) {
		const url = new URL($page.url);
		url.searchParams.set('limit', newLimit.toString());
		url.searchParams.set('page', '1'); // Reset to first page
		goto(url.toString());
	}

	function handleDeleteRequest(event: CustomEvent<{ subscription: SubscriptionWithCategory }>) {
		subscriptionToDelete = event.detail.subscription;
		deleteModalOpen = true;
	}

	async function confirmDelete() {
		if (!subscriptionToDelete) return;

		isDeleting = true;
		try {
			const response = await fetch(`/api/subscriptions/${subscriptionToDelete.id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				// Refresh the page to update the list
				location.reload();
			} else {
				const result = await response.json();
				alert('Failed to delete subscription: ' + (result.message || 'Unknown error'));
			}
		} catch (error) {
			console.error('Delete error:', error);
			alert('Failed to delete subscription. Please try again.');
		} finally {
			isDeleting = false;
			deleteModalOpen = false;
			subscriptionToDelete = null;
		}
	}

	function cancelDelete() {
		deleteModalOpen = false;
		subscriptionToDelete = null;
	}

	// Initialize filter values from URL
	selectedCategory =
		(data.filters && 'categoryId' in data.filters ? data.filters.categoryId : '') || '';
	selectedCurrency =
		(data.filters && 'currency' in data.filters ? data.filters.currency : '') || '';
	selectedPaidBy = (data.filters && 'paidBy' in data.filters ? data.filters.paidBy : '') || '';
	showDisabled =
		(data.filters && 'disabled' in data.filters ? data.filters.disabled : false) || false;
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
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
			<!-- View Toggle -->
			<div class="join">
				<button
					class="btn join-item btn-sm {viewMode === 'table' ? 'btn-active' : 'btn-outline'}"
					onclick={() => (viewMode = 'table')}
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h3M7 3v18M17 3v18m3-14V4a1 1 0 00-1-1h-3"
						/>
					</svg>
					Table
				</button>
				<button
					class="btn join-item btn-sm {viewMode === 'list' ? 'btn-active' : 'btn-outline'}"
					onclick={() => (viewMode = 'list')}
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 10h16M4 14h16M4 18h16"
						/>
					</svg>
					Cards
				</button>
			</div>
			<a href="/subscriptions/add" class="btn btn-primary btn-sm">
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
	</div>

	<!-- Summary Stats -->
	<div class="stats stats-vertical lg:stats-horizontal bg-base-100 w-full shadow">
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
			<div class="stat-value text-primary">{data.pagination.total}</div>
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
				{filteredSubscriptions.filter((s) => !s.disabled).length}
			</div>
		</div>
	</div>

	<!-- Filters -->
	<div class="card bg-base-100 shadow-lg">
		<div class="card-body">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="card-title">
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
				<button
					class="btn btn-ghost btn-sm lg:hidden"
					onclick={() => (filtersCollapsed = !filtersCollapsed)}
				>
					{filtersCollapsed ? 'Show' : 'Hide'}
					<svg
						class="h-4 w-4 transition-transform {filtersCollapsed ? 'rotate-180' : ''}"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>
			</div>

			<div
				class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6 {filtersCollapsed
					? 'hidden lg:grid'
					: ''}"
			>
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
							class="input input-bordered input-sm w-full pr-10"
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
					<select
						id="category"
						bind:value={selectedCategory}
						class="select select-bordered select-sm w-full"
					>
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
					<select
						id="currency"
						bind:value={selectedCurrency}
						class="select select-bordered select-sm w-full"
					>
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
					<select
						id="paidBy"
						bind:value={selectedPaidBy}
						class="select select-bordered select-sm w-full"
					>
						<option value="">All</option>
						{#each uniquePaidBy as paidBy}
							<option value={paidBy}>{paidBy}</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer">
						<span class="label-text">Show disabled</span>
						<input
							type="checkbox"
							bind:checked={showDisabled}
							class="toggle toggle-primary toggle-sm"
						/>
					</label>
				</div>

				<div class="form-control">
					<label class="label" for="limit">
						<span class="label-text">Per page</span>
					</label>
					<select
						id="limit"
						class="select select-bordered select-sm w-full"
						value={data.pagination.limit}
						onchange={(e) => changeLimit(parseInt(e.currentTarget.value))}
					>
						<option value="10">10</option>
						<option value="25">25</option>
						<option value="50">50</option>
						<option value="100">100</option>
					</select>
				</div>
			</div>

			<!-- Filter Actions -->
			<div
				class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between {filtersCollapsed
					? 'hidden lg:flex'
					: ''}"
			>
				<div class="text-sm opacity-70">
					Showing {filteredSubscriptions.length} of {data.pagination.total} subscriptions
				</div>
				<div class="flex flex-col gap-2 sm:flex-row">
					<button class="btn btn-primary btn-sm" onclick={applyFilters}>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
							/>
						</svg>
						Apply Filters
					</button>
					<button class="btn btn-outline btn-sm" onclick={clearFilters}>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							></path>
						</svg>
						Clear
					</button>
				</div>
			</div>
		</div>

		<!-- Subscriptions -->
		<div class="space-y-4">
			{#if filteredSubscriptions.length === 0}
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
						<h3 class="mb-2 text-xl font-semibold">No subscriptions found</h3>
						<p class="text-base-content/70 mb-6">
							{#if searchTerm || (data.filters && 'categoryId' in data.filters && data.filters.categoryId) || (data.filters && 'currency' in data.filters && data.filters.currency) || (data.filters && 'paidBy' in data.filters && data.filters.paidBy)}
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
				</div>
			{:else if viewMode === 'list'}
				<!-- List/Card View -->
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each filteredSubscriptions as subscription}
						<SubscriptionListCard {subscription} on:delete={handleDeleteRequest} />
					{/each}
				</div>
			{:else}
				<!-- Table View -->
				<div class="card bg-base-100 shadow-lg">
					<div class="overflow-x-auto">
						<table class="table">
							<thead>
								<tr class="border-base-300">
									<th>
										<button
											class="btn btn-ghost btn-sm justify-start text-left"
											onclick={() => handleSort('name')}
										>
											Service
											{#if data.sort?.field === 'name'}
												<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													{#if data.sort.direction === 'asc'}
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
											class="btn btn-ghost btn-sm justify-start text-left"
											onclick={() => handleSort('price')}
										>
											Price
											{#if data.sort?.field === 'price'}
												<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													{#if data.sort.direction === 'asc'}
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
											class="btn btn-ghost btn-sm justify-start text-left"
											onclick={() => handleSort('nextPayment')}
										>
											Next Payment
											{#if data.sort?.field === 'nextPayment'}
												<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													{#if data.sort.direction === 'asc'}
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
									<th class="hidden lg:table-cell">Category</th>
									<th class="hidden sm:table-cell">Status</th>
									<th class="text-right">Actions</th>
								</tr>
							</thead>
							<tbody>
								{#each filteredSubscriptions as subscription}
									<tr class="hover:bg-base-200/50">
										<td>
											<div class="flex items-center gap-3">
												<div class="avatar">
													<div class="mask mask-squircle h-10 w-10 flex-shrink-0">
														{#if subscription.logo}
															<img
																src={subscription.logo}
																alt={subscription.name}
																class="object-cover"
															/>
														{:else}
															<div
																class="bg-neutral text-neutral-content flex h-full w-full items-center justify-center"
															>
																<span class="text-sm font-bold">
																	{subscription.name.charAt(0).toUpperCase()}
																</span>
															</div>
														{/if}
													</div>
												</div>
												<div class="min-w-0 flex-1">
													<div class="truncate font-bold">{subscription.name}</div>
													{#if subscription.paidBy}
														<div class="truncate text-xs opacity-50">
															Paid by {subscription.paidBy}
														</div>
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
										<td class="whitespace-nowrap">
											{formatDate(subscription.nextPayment)}
										</td>
										<td class="hidden lg:table-cell">
											{#if subscription.category}
												<div class="badge badge-outline badge-sm">
													{subscription.category.name}
												</div>
											{:else}
												<span class="text-base-content/50 text-sm">Uncategorized</span>
											{/if}
										</td>
										<td class="hidden sm:table-cell">
											{#if subscription.disabled}
												<div class="badge badge-error badge-outline badge-sm">Disabled</div>
											{:else}
												<div class="badge badge-success badge-outline badge-sm">Active</div>
											{/if}
										</td>
										<td class="text-right">
											<div class="flex justify-end gap-1">
												<a
													href="/subscriptions/{subscription.id}"
													class="btn btn-ghost btn-xs"
													aria-label="View {subscription.name} details"
												>
													<svg
														class="h-4 w-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
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
													<svg
														class="h-4 w-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
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
													onclick={() => {
														subscriptionToDelete = subscription;
														deleteModalOpen = true;
													}}
													aria-label="Delete {subscription.name}"
												>
													<svg
														class="h-4 w-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
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
				</div>
			{/if}

			<!-- Pagination -->
			{#if data.pagination.totalPages > 1}
				<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
					<div class="text-sm opacity-70">
						Page {data.pagination.page} of {data.pagination.totalPages}
						({data.pagination.total} total items)
					</div>
					<div class="join">
						<button
							class="join-item btn btn-sm"
							disabled={!data.pagination.hasPrev}
							onclick={() => changePage(data.pagination.page - 1)}
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 19l-7-7 7-7"
								/>
							</svg>
							Previous
						</button>

						{#if data.pagination.totalPages <= 7}
							{#each Array(data.pagination.totalPages) as _, i}
								<button
									class="join-item btn btn-sm {data.pagination.page === i + 1 ? 'btn-active' : ''}"
									onclick={() => changePage(i + 1)}
								>
									{i + 1}
								</button>
							{/each}
						{:else}
							{#if data.pagination.page > 3}
								<button class="join-item btn btn-sm" onclick={() => changePage(1)}>1</button>
								{#if data.pagination.page > 4}
									<span class="join-item btn btn-sm btn-disabled">...</span>
								{/if}
							{/if}

							{#each Array(Math.min(5, data.pagination.totalPages)) as _, i}
								{@const pageNum =
									Math.max(1, Math.min(data.pagination.totalPages - 4, data.pagination.page - 2)) +
									i}
								{#if pageNum <= data.pagination.totalPages}
									<button
										class="join-item btn btn-sm {data.pagination.page === pageNum
											? 'btn-active'
											: ''}"
										onclick={() => changePage(pageNum)}
									>
										{pageNum}
									</button>
								{/if}
							{/each}

							{#if data.pagination.page < data.pagination.totalPages - 2}
								{#if data.pagination.page < data.pagination.totalPages - 3}
									<span class="join-item btn btn-sm btn-disabled">...</span>
								{/if}
								<button
									class="join-item btn btn-sm"
									onclick={() => changePage(data.pagination.totalPages)}
								>
									{data.pagination.totalPages}
								</button>
							{/if}
						{/if}

						<button
							class="join-item btn btn-sm"
							disabled={!data.pagination.hasNext}
							onclick={() => changePage(data.pagination.page + 1)}
						>
							Next
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Delete Confirmation Modal -->
<DeleteConfirmModal
	isOpen={deleteModalOpen}
	subscriptionName={subscriptionToDelete?.name || ''}
	loading={isDeleting}
	on:confirm={confirmDelete}
	on:cancel={cancelDelete}
/>
