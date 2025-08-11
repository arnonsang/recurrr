<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	interface Props {
		isOpen: boolean;
		subscriptionName: string;
		loading?: boolean;
	}

	let { isOpen = false, subscriptionName, loading = false }: Props = $props();

	const dispatch = createEventDispatcher<{
		confirm: void;
		cancel: void;
	}>();

	function handleConfirm() {
		dispatch('confirm');
	}

	function handleCancel() {
		dispatch('cancel');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleCancel();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<!-- Modal backdrop -->
	<div class="modal modal-open">
		<div class="modal-box">
			<div class="mb-4 flex items-center gap-3">
				<div class="flex-shrink-0">
					<svg
						class="text-error h-8 w-8"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
						></path>
					</svg>
				</div>
				<div>
					<h3 class="text-lg font-bold">Delete Subscription</h3>
					<p class="text-sm opacity-70">This action cannot be undone</p>
				</div>
			</div>

			<div class="mb-6">
				<p class="text-base-content">
					Are you sure you want to delete <strong>{subscriptionName}</strong>? This will permanently
					remove the subscription and all associated data.
				</p>
			</div>

			<div class="modal-action">
				<button type="button" class="btn btn-ghost" onclick={handleCancel} disabled={loading}>
					Cancel
				</button>
				<button type="button" class="btn btn-error" onclick={handleConfirm} disabled={loading}>
					{#if loading}
						<span class="loading loading-spinner loading-sm"></span>
						Deleting...
					{:else}
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							></path>
						</svg>
						Delete
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}
