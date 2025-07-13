<script lang="ts">
	export let amount: number;
	export let currency: string;
	export let convertTo: string = 'THB';
	export let showOriginal: boolean = true;

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

	// TODO: Implement actual currency conversion using the currency service
	function convertCurrency(amount: number, from: string, to: string): number {
		// Placeholder conversion - should use actual exchange rates
		const rates: { [key: string]: number } = {
			USD: 1,
			THB: 36.5,
			EUR: 0.85,
			GBP: 0.73
		};

		if (from === to) return amount;

		const usdAmount = amount / (rates[from] || 1);
		return usdAmount * (rates[to] || 1);
	}

	$: convertedAmount = convertCurrency(amount, currency, convertTo);
	$: needsConversion = currency !== convertTo;
</script>

<div class="currency-display">
	{#if needsConversion && showOriginal}
		<div class="space-y-1">
			<div class="text-lg font-semibold">
				{formatCurrency(convertedAmount, convertTo)}
			</div>
			<div class="text-sm opacity-70">
				({formatCurrency(amount, currency)})
			</div>
		</div>
	{:else}
		<div class="text-lg font-semibold">
			{formatCurrency(amount, currency)}
		</div>
	{/if}
</div>
