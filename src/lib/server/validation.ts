import { getSupportedCurrencies } from './currency.js';

export interface ValidationError {
	field: string;
	message: string;
}

export interface ValidationResult {
	success: boolean;
	errors: ValidationError[];
	data?: any;
}

export interface SubscriptionFormData {
	name: string;
	logo?: string;
	price: string | number;
	currency: string;
	paymentDay: string | number;
	paymentMonth: string | number;
	nextPayment: string | Date;
	paymentMethod?: string;
	categoryId?: string;
	paidBy?: string;
	link?: string;
	notes?: string;
}

export function validateSubscriptionData(data: SubscriptionFormData): ValidationResult {
	const errors: ValidationError[] = [];

	// Validate name
	if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
		errors.push({ field: 'name', message: 'Name is required' });
	} else if (data.name.trim().length > 100) {
		errors.push({ field: 'name', message: 'Name must be less than 100 characters' });
	}

	// Validate price
	const price = typeof data.price === 'string' ? parseFloat(data.price) : data.price;
	if (isNaN(price) || price <= 0) {
		errors.push({ field: 'price', message: 'Price must be a positive number' });
	} else if (price > 1000000) {
		errors.push({ field: 'price', message: 'Price must be less than 1,000,000' });
	}

	// Validate currency
	const supportedCurrencies = getSupportedCurrencies();
	if (!data.currency || !supportedCurrencies.includes(data.currency)) {
		errors.push({
			field: 'currency',
			message: `Currency must be one of: ${supportedCurrencies.join(', ')}`
		});
	}

	// Validate payment schedule
	const paymentDay =
		typeof data.paymentDay === 'string' ? parseInt(data.paymentDay) : data.paymentDay;
	const paymentMonth =
		typeof data.paymentMonth === 'string' ? parseInt(data.paymentMonth) : data.paymentMonth;

	if (isNaN(paymentDay) || paymentDay < 1 || paymentDay > 31) {
		errors.push({ field: 'paymentDay', message: 'Payment day must be between 1 and 31' });
	}

	if (isNaN(paymentMonth) || paymentMonth < 1 || paymentMonth > 12) {
		errors.push({
			field: 'paymentMonth',
			message: 'Payment month interval must be between 1 and 12'
		});
	}

	// Validate next payment date
	let nextPayment: Date;
	if (data.nextPayment instanceof Date) {
		nextPayment = data.nextPayment;
	} else if (typeof data.nextPayment === 'string') {
		nextPayment = new Date(data.nextPayment);
	} else {
		errors.push({ field: 'nextPayment', message: 'Next payment date is required' });
		nextPayment = new Date();
	}

	if (isNaN(nextPayment.getTime())) {
		errors.push({ field: 'nextPayment', message: 'Next payment date must be a valid date' });
	} else if (nextPayment < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
		errors.push({ field: 'nextPayment', message: 'Next payment date cannot be in the past' });
	}

	// Validate optional fields
	if (data.logo && !isValidUrl(data.logo)) {
		errors.push({ field: 'logo', message: 'Logo must be a valid URL' });
	}

	if (data.link && !isValidUrl(data.link)) {
		errors.push({ field: 'link', message: 'Link must be a valid URL' });
	}

	if (data.paymentMethod && data.paymentMethod.length > 50) {
		errors.push({
			field: 'paymentMethod',
			message: 'Payment method must be less than 50 characters'
		});
	}

	if (data.paidBy && data.paidBy.length > 50) {
		errors.push({ field: 'paidBy', message: 'Paid by must be less than 50 characters' });
	}

	if (data.notes && data.notes.length > 1000) {
		errors.push({ field: 'notes', message: 'Notes must be less than 1000 characters' });
	}

	if (errors.length > 0) {
		return { success: false, errors };
	}

	// Return cleaned data
	const cleanedData = {
		name: data.name.trim(),
		logo: data.logo?.trim() || undefined,
		price,
		currency: data.currency,
		paymentEvery: { day: paymentDay, month: paymentMonth },
		nextPayment,
		paymentMethod: data.paymentMethod?.trim() || undefined,
		categoryId: data.categoryId?.trim() || undefined,
		paidBy: data.paidBy?.trim() || undefined,
		link: data.link?.trim() || undefined,
		notes: data.notes?.trim() || undefined
	};

	return { success: true, errors: [], data: cleanedData };
}

export interface CategoryFormData {
	name: string;
	description?: string;
}

export function validateCategoryData(data: CategoryFormData): ValidationResult {
	const errors: ValidationError[] = [];

	// Validate name
	if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
		errors.push({ field: 'name', message: 'Category name is required' });
	} else if (data.name.trim().length > 50) {
		errors.push({ field: 'name', message: 'Category name must be less than 50 characters' });
	}

	// Validate description
	if (data.description && data.description.length > 200) {
		errors.push({ field: 'description', message: 'Description must be less than 200 characters' });
	}

	if (errors.length > 0) {
		return { success: false, errors };
	}

	const cleanedData = {
		name: data.name.trim(),
		description: data.description?.trim() || undefined
	};

	return { success: true, errors: [], data: cleanedData };
}

function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

export function getValidationErrorMessage(
	errors: ValidationError[],
	field: string
): string | undefined {
	const error = errors.find((e) => e.field === field);
	return error?.message;
}
