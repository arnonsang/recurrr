<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let loading = $state(false);
	let showNewCategoryForm = $state(false);
	let newCategoryName = $state('');
	let newCategoryDescription = $state('');

	function getErrorMessage(field: string): string | undefined {
		return form?.errors?.find((e) => e.field === field)?.message;
	}

	function getFieldValue(field: string): string {
		if (form && 'values' in form) {
			return (form.values as any)?.[field] || '';
		}
		// Use existing subscription data as fallback
		const subscription = data.subscription;
		switch (field) {
			case 'name':
				return subscription.name;
			case 'price':
				return subscription.price.toString();
			case 'currency':
				return subscription.currency;
			case 'paymentDay':
				return subscription.paymentEvery.day.toString();
			case 'paymentMonth':
				return subscription.paymentEvery.month.toString();
			case 'nextPayment':
				return new Date(subscription.nextPayment).toISOString().split('T')[0];
			case 'categoryId':
				return subscription.categoryId || '';
			case 'logo':
				return subscription.logo || '';
			case 'link':
				return subscription.link || '';
			case 'notes':
				return subscription.notes || '';
			case 'paidBy':
				return subscription.paidBy || '';
			case 'paymentMethod':
				return subscription.paymentMethod || '';
			default:
				return '';
		}
	}

	let isDisabled = $derived(
		(form && 'values' in form ? (form.values as any)?.disabled : undefined) ??
			data.subscription.disabled
	);

	async function createCategory() {
		if (!newCategoryName.trim()) return;

		try {
			const response = await fetch('/api/categories', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: newCategoryName.trim(),
					description: newCategoryDescription.trim() || undefined
				})
			});

			const result = await response.json();

			if (response.ok && result.success) {
				const newCategory = result.data;
				// Add new category to the list
				data.categories = [...data.categories, newCategory];
				// Reset form
				newCategoryName = '';
				newCategoryDescription = '';
				showNewCategoryForm = false;
				// Select the new category
				const categorySelect = document.getElementById('categoryId') as HTMLSelectElement;
				if (categorySelect) {
					categorySelect.value = newCategory.id;
				}
			} else {
				// Handle validation errors or other failures
				const errorMessage =
					result.errors?.[0]?.message || result.message || 'Failed to create category';
				console.error('Category creation failed:', errorMessage);
				alert(errorMessage);
			}
		} catch (error) {
			console.error('Failed to create category:', error);
			alert('Network error: Failed to create category');
		}
	}
</script>

<svelte:head>
	<title>Edit {data.subscription.name} - Recurrr</title>
</svelte:head>

<div class="container mx-auto max-w-3xl px-4 py-8">
	<div class="mb-8">
		<div class="breadcrumbs text-sm">
			<ul>
				<li><a href="/subscriptions" class="link link-hover">Subscriptions</a></li>
				<li>
					<a href="/subscriptions/{data.subscription.id}" class="link link-hover"
						>{data.subscription.name}</a
					>
				</li>
				<li>Edit</li>
			</ul>
		</div>
		<h1 class="mt-4 text-3xl font-bold">Edit Subscription</h1>
		<p class="mt-2 opacity-70">Update subscription details and payment information</p>
	</div>

	<div class="card bg-base-100 shadow-md">
		<form
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update();
				};
			}}
			class="card-body space-y-6"
		>
			{#if form?.errors?.find((e) => e.field === 'general')}
				<div class="alert alert-error">
					<svg
						class="h-5 w-5"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clip-rule="evenodd"
						/>
					</svg>
					<div>
						<div class="font-medium">Error</div>
						<div>{getErrorMessage('general')}</div>
					</div>
				</div>
			{/if}

			<!-- Status Toggle -->
			<div class="form-control">
				<label class="label cursor-pointer justify-start gap-3">
					<input type="checkbox" name="disabled" class="toggle toggle-error" checked={isDisabled} />
					<div>
						<span class="label-text font-medium">Disable Subscription</span>
						<div class="label-text-alt opacity-70">
							Disabled subscriptions won't appear in payment calculations
						</div>
					</div>
				</label>
			</div>

			<!-- Basic Information -->
			<div class="space-y-4">
				<h3 class="text-lg font-medium">Basic Information</h3>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="form-control">
						<label for="name" class="label">
							<span class="label-text">Service Name *</span>
						</label>
						<input
							type="text"
							id="name"
							name="name"
							required
							value={getFieldValue('name')}
							placeholder="e.g., Netflix, Spotify, GitHub"
							class="input input-bordered {getErrorMessage('name') ? 'input-error' : ''}"
						/>
						{#if getErrorMessage('name')}
							<div class="label">
								<span class="label-text-alt text-error">{getErrorMessage('name')}</span>
							</div>
						{/if}
					</div>

					<div class="form-control">
						<label for="logo" class="label">
							<span class="label-text">Logo URL</span>
						</label>
						<input
							type="url"
							id="logo"
							name="logo"
							value={getFieldValue('logo')}
							placeholder="https://logo.clearbit.com/netflix.com"
							class="input input-bordered {getErrorMessage('logo') ? 'input-error' : ''}"
						/>
						{#if getErrorMessage('logo')}
							<div class="label">
								<span class="label-text-alt text-error">{getErrorMessage('logo')}</span>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Pricing -->
			<div class="space-y-4">
				<h3 class="text-lg font-medium">Pricing</h3>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="form-control">
						<label for="price" class="label">
							<span class="label-text">Price *</span>
						</label>
						<input
							type="number"
							id="price"
							name="price"
							required
							step="0.01"
							min="0"
							value={getFieldValue('price')}
							placeholder="9.99"
							class="input input-bordered {getErrorMessage('price') ? 'input-error' : ''}"
						/>
						{#if getErrorMessage('price')}
							<div class="label">
								<span class="label-text-alt text-error">{getErrorMessage('price')}</span>
							</div>
						{/if}
					</div>

					<div class="form-control">
						<label for="currency" class="label">
							<span class="label-text">Currency *</span>
						</label>
						<select
							id="currency"
							name="currency"
							required
							class="select select-bordered {getErrorMessage('currency') ? 'select-error' : ''}"
						>
							<option value="">Select currency</option>
							{#each data.currencies as currency}
								<option value={currency} selected={getFieldValue('currency') === currency}>
									{currency}
								</option>
							{/each}
						</select>
						{#if getErrorMessage('currency')}
							<div class="label">
								<span class="label-text-alt text-error">{getErrorMessage('currency')}</span>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Payment Schedule -->
			<div class="space-y-4">
				<h3 class="text-lg font-medium">Payment Schedule</h3>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
					<div class="form-control">
						<label for="paymentDay" class="label">
							<span class="label-text">Payment Day *</span>
						</label>
						<input
							type="number"
							id="paymentDay"
							name="paymentDay"
							required
							min="1"
							max="31"
							value={getFieldValue('paymentDay')}
							class="input input-bordered {getErrorMessage('paymentDay') ? 'input-error' : ''}"
						/>
						{#if getErrorMessage('paymentDay')}
							<div class="label">
								<span class="label-text-alt text-error">{getErrorMessage('paymentDay')}</span>
							</div>
						{/if}
					</div>

					<div class="form-control">
						<label for="paymentMonth" class="label">
							<span class="label-text">Every (months) *</span>
						</label>
						<select
							id="paymentMonth"
							name="paymentMonth"
							required
							class="select select-bordered {getErrorMessage('paymentMonth') ? 'select-error' : ''}"
						>
							<option value="1" selected={getFieldValue('paymentMonth') === '1'}>Monthly (1)</option
							>
							<option value="3" selected={getFieldValue('paymentMonth') === '3'}
								>Quarterly (3)</option
							>
							<option value="6" selected={getFieldValue('paymentMonth') === '6'}
								>Semi-annually (6)</option
							>
							<option value="12" selected={getFieldValue('paymentMonth') === '12'}
								>Annually (12)</option
							>
						</select>
						{#if getErrorMessage('paymentMonth')}
							<div class="label">
								<span class="label-text-alt text-error">{getErrorMessage('paymentMonth')}</span>
							</div>
						{/if}
					</div>

					<div class="form-control">
						<label for="nextPayment" class="label">
							<span class="label-text">Next Payment *</span>
						</label>
						<input
							type="date"
							id="nextPayment"
							name="nextPayment"
							required
							value={getFieldValue('nextPayment')}
							class="input input-bordered {getErrorMessage('nextPayment') ? 'input-error' : ''}"
						/>
						{#if getErrorMessage('nextPayment')}
							<div class="label">
								<span class="label-text-alt text-error">{getErrorMessage('nextPayment')}</span>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Additional Details -->
			<div class="space-y-4">
				<h3 class="text-lg font-medium">Additional Details</h3>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="form-control">
						<label for="categoryId" class="label">
							<span class="label-text">Category</span>
						</label>
						<div class="flex gap-2">
							<select id="categoryId" name="categoryId" class="select select-bordered flex-1">
								<option value="">Select category</option>
								{#each data.categories as category}
									<option
										value={category.id}
										selected={getFieldValue('categoryId') === category.id}
									>
										{category.name}
									</option>
								{/each}
							</select>
							<button
								type="button"
								class="btn btn-outline btn-sm"
								onclick={() => (showNewCategoryForm = !showNewCategoryForm)}
							>
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 6v6m0 0v6m0-6h6m-6 0H6"
									></path>
								</svg>
								New
							</button>
						</div>

						{#if showNewCategoryForm}
							<div class="border-base-300 bg-base-50 mt-3 rounded-lg border p-4">
								<h4 class="mb-3 font-medium">Create New Category</h4>
								<div class="space-y-3">
									<div class="form-control">
										<label class="label">
											<span class="label-text">Category Name *</span>
										</label>
										<input
											type="text"
											bind:value={newCategoryName}
											placeholder="e.g., Entertainment, Work, Utilities"
											class="input input-bordered input-sm"
										/>
									</div>
									<div class="form-control">
										<label class="label">
											<span class="label-text">Description</span>
										</label>
										<input
											type="text"
											bind:value={newCategoryDescription}
											placeholder="Optional description"
											class="input input-bordered input-sm"
										/>
									</div>
									<div class="flex justify-end gap-2">
										<button
											type="button"
											class="btn btn-ghost btn-sm"
											onclick={() => {
												showNewCategoryForm = false;
												newCategoryName = '';
												newCategoryDescription = '';
											}}
										>
											Cancel
										</button>
										<button
											type="button"
											class="btn btn-primary btn-sm"
											onclick={createCategory}
											disabled={!newCategoryName.trim()}
										>
											Create Category
										</button>
									</div>
								</div>
							</div>
						{/if}
					</div>

					<div class="form-control">
						<label for="paidBy" class="label">
							<span class="label-text">Paid By</span>
						</label>
						<input
							type="text"
							id="paidBy"
							name="paidBy"
							value={getFieldValue('paidBy')}
							placeholder="e.g., Me, Company, Shared"
							class="input input-bordered"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="form-control">
						<label for="paymentMethod" class="label">
							<span class="label-text">Payment Method</span>
						</label>
						<input
							type="text"
							id="paymentMethod"
							name="paymentMethod"
							value={getFieldValue('paymentMethod')}
							placeholder="e.g., Visa •••• 1234, PayPal"
							class="input input-bordered"
						/>
					</div>

					<div class="form-control">
						<label for="link" class="label">
							<span class="label-text">Account/Billing Link</span>
						</label>
						<input
							type="url"
							id="link"
							name="link"
							value={getFieldValue('link')}
							placeholder="https://..."
							class="input input-bordered {getErrorMessage('link') ? 'input-error' : ''}"
						/>
						{#if getErrorMessage('link')}
							<div class="label">
								<span class="label-text-alt text-error">{getErrorMessage('link')}</span>
							</div>
						{/if}
					</div>
				</div>

				<div class="form-control">
					<label for="notes" class="label">
						<span class="label-text">Notes</span>
					</label>
					<textarea
						id="notes"
						name="notes"
						rows="3"
						value={getFieldValue('notes')}
						placeholder="Additional notes or reminders (supports Markdown)"
						class="textarea textarea-bordered {getErrorMessage('notes') ? 'textarea-error' : ''}"
					></textarea>
					{#if getErrorMessage('notes')}
						<div class="label">
							<span class="label-text-alt text-error">{getErrorMessage('notes')}</span>
						</div>
					{/if}
				</div>
			</div>

			<!-- Actions -->
			<div class="divider"></div>
			<div class="flex justify-end gap-3">
				<a href="/subscriptions/{data.subscription.id}" class="btn btn-ghost">Cancel</a>
				<button type="submit" disabled={loading} class="btn btn-primary">
					{loading ? 'Saving...' : 'Save Changes'}
				</button>
			</div>
		</form>
	</div>
</div>
