<script lang="ts">
	import type { SubscriptionWithCategory } from '$lib/server/subscription';
	import CurrencyDisplay from './CurrencyDisplay.svelte';

	export let subscriptions: SubscriptionWithCategory[] = [];
	export let month: Date = new Date();

	interface DayPayment {
		date: Date;
		subscriptions: SubscriptionWithCategory[];
		total: number;
	}

	function getDaysInMonth(date: Date): number {
		return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
	}

	function getFirstDayOfMonth(date: Date): number {
		return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
	}

	function getPaymentsForMonth(
		subscriptions: SubscriptionWithCategory[],
		month: Date
	): DayPayment[] {
		const year = month.getFullYear();
		const monthIndex = month.getMonth();
		const daysInMonth = getDaysInMonth(month);

		const days: DayPayment[] = [];

		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(year, monthIndex, day);
			const daySubscriptions = subscriptions.filter((sub) => {
				const nextPayment = new Date(sub.nextPayment);
				return (
					nextPayment.getDate() === day &&
					nextPayment.getMonth() === monthIndex &&
					nextPayment.getFullYear() === year &&
					!sub.disabled
				);
			});

			const total = daySubscriptions.reduce((sum, sub) => sum + sub.price, 0);

			days.push({
				date,
				subscriptions: daySubscriptions,
				total
			});
		}

		return days;
	}

	function formatMonth(date: Date): string {
		return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
	}

	function previousMonth() {
		month = new Date(month.getFullYear(), month.getMonth() - 1, 1);
	}

	function nextMonth() {
		month = new Date(month.getFullYear(), month.getMonth() + 1, 1);
	}

	function isToday(date: Date): boolean {
		const today = new Date();
		return date.toDateString() === today.toDateString();
	}

	$: daysData = getPaymentsForMonth(subscriptions, month);
	$: firstDay = getFirstDayOfMonth(month);
	$: monthTotal = daysData.reduce((sum, day) => sum + day.total, 0);
</script>

<div class="card bg-base-100 border-base-200 border shadow-md">
	<div class="card-body p-6">
		<!-- Header -->
		<div class="mb-6 flex items-center justify-between">
			<h2 class="card-title text-lg">Payment Calendar</h2>
			<div class="flex items-center gap-4">
				<div class="text-sm opacity-70">
					Monthly Total: <CurrencyDisplay amount={monthTotal} currency="THB" showOriginal={false} />
				</div>
				<div class="flex items-center gap-1">
					<button
						on:click={previousMonth}
						class="btn btn-ghost btn-sm btn-square"
						aria-label="Previous month"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							></path>
						</svg>
					</button>
					<h3 class="min-w-[200px] text-center font-medium">
						{formatMonth(month)}
					</h3>
					<button
						on:click={nextMonth}
						class="btn btn-ghost btn-sm btn-square"
						aria-label="Next month"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"
							></path>
						</svg>
					</button>
				</div>
			</div>
		</div>

		<!-- Calendar Grid -->
		<div class="bg-base-200 grid grid-cols-7 gap-px overflow-hidden rounded-lg">
			<!-- Day Headers -->
			{#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as day}
				<div class="bg-base-300 px-3 py-2 text-center text-xs font-medium uppercase opacity-70">
					{day}
				</div>
			{/each}

			<!-- Empty cells for days before month starts -->
			{#each Array(firstDay) as _}
				<div class="bg-base-100 h-24"></div>
			{/each}

			<!-- Calendar Days -->
			{#each daysData as dayData}
				<div
					class="bg-base-100 relative h-24 p-1 {isToday(dayData.date) ? 'ring-primary ring-2' : ''}"
				>
					<div class="mb-1 text-sm font-medium">
						{dayData.date.getDate()}
					</div>

					{#if dayData.subscriptions.length > 0}
						<div class="space-y-1">
							{#each dayData.subscriptions.slice(0, 2) as subscription}
								<div class="bg-primary/20 text-primary truncate rounded px-1 py-0.5 text-xs">
									{subscription.name}
								</div>
							{/each}

							{#if dayData.subscriptions.length > 2}
								<div class="text-xs opacity-70">
									+{dayData.subscriptions.length - 2} more
								</div>
							{/if}

							{#if dayData.total > 0}
								<div class="absolute right-1 bottom-1 text-xs font-medium">
									<CurrencyDisplay amount={dayData.total} currency="THB" showOriginal={false} />
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Legend -->
		<div class="mt-4 flex items-center justify-between text-sm opacity-70">
			<div class="flex items-center gap-4">
				<div class="flex items-center gap-2">
					<div class="bg-primary/20 h-3 w-3 rounded"></div>
					<span>Payment due</span>
				</div>
				<div class="flex items-center gap-2">
					<div class="border-primary h-3 w-3 rounded border-2"></div>
					<span>Today</span>
				</div>
			</div>
			<div>
				{daysData.filter((d) => d.subscriptions.length > 0).length} payment days this month
			</div>
		</div>
	</div>
</div>
