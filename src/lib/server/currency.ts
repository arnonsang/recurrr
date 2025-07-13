interface ExchangeRates {
	[currency: string]: number;
}

interface ExchangeRateResponse {
	amount: number;
	base: string;
	date: string;
	rates: ExchangeRates;
}

const FRANKFURTER_API = 'https://api.frankfurter.app';
const DEFAULT_CURRENCY = 'THB';

// Cache for exchange rates (simple in-memory cache)
const rateCache = new Map<string, { rates: ExchangeRates; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function getExchangeRates(baseCurrency: string = 'USD'): Promise<ExchangeRates> {
	const cacheKey = baseCurrency;
	const cached = rateCache.get(cacheKey);

	// Return cached rates if still valid
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.rates;
	}

	try {
		const response = await fetch(`${FRANKFURTER_API}/latest?from=${baseCurrency}`);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data: ExchangeRateResponse = await response.json();

		// Cache the rates
		rateCache.set(cacheKey, {
			rates: data.rates,
			timestamp: Date.now()
		});

		return data.rates;
	} catch (error) {
		console.error('Failed to fetch exchange rates:', error);

		// Return cached rates if available, even if expired
		if (cached) {
			return cached.rates;
		}

		// Fallback to basic rates if no cache available
		return getFallbackRates(baseCurrency);
	}
}

export async function convertCurrency(
	amount: number,
	fromCurrency: string,
	toCurrency: string = DEFAULT_CURRENCY
): Promise<number> {
	if (fromCurrency === toCurrency) {
		return amount;
	}

	try {
		const response = await fetch(
			`${FRANKFURTER_API}/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data: ExchangeRateResponse = await response.json();
		return data.rates[toCurrency] || amount;
	} catch (error) {
		console.error('Failed to convert currency:', error);

		// Fallback to approximate conversion using cached rates
		try {
			const rates = await getExchangeRates(fromCurrency);
			return amount * (rates[toCurrency] || 1);
		} catch {
			return amount; // Last resort: return original amount
		}
	}
}

export async function convertToDefaultCurrency(
	amount: number,
	fromCurrency: string
): Promise<number> {
	return convertCurrency(amount, fromCurrency, DEFAULT_CURRENCY);
}

export function formatCurrency(amount: number, currency: string): string {
	try {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency
		}).format(amount);
	} catch (error) {
		// Fallback for unsupported currencies
		return `${amount.toFixed(2)} ${currency}`;
	}
}

export function getSupportedCurrencies(): string[] {
	return [
		'THB', // Thai Baht (default)
		'USD', // US Dollar
		'EUR', // Euro
		'GBP', // British Pound
		'JPY', // Japanese Yen
		'AUD', // Australian Dollar
		'CAD', // Canadian Dollar
		'CHF', // Swiss Franc
		'CNY', // Chinese Yuan
		'SGD', // Singapore Dollar
		'HKD', // Hong Kong Dollar
		'KRW', // South Korean Won
		'MYR', // Malaysian Ringgit
		'PHP', // Philippine Peso
		'VND', // Vietnamese Dong
		'IDR', // Indonesian Rupiah
		'INR' // Indian Rupee
	];
}

function getFallbackRates(baseCurrency: string): ExchangeRates {
	// Very basic fallback rates (should be updated with real data)
	const fallbackRates: { [base: string]: ExchangeRates } = {
		USD: {
			THB: 36.5,
			EUR: 0.85,
			GBP: 0.73,
			JPY: 110,
			AUD: 1.35,
			CAD: 1.25
		},
		EUR: {
			USD: 1.18,
			THB: 43,
			GBP: 0.86,
			JPY: 130
		}
	};

	return fallbackRates[baseCurrency] || {};
}
