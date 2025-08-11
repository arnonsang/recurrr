<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import {
		RotateCcw,
		CheckCircle,
		TrendingUp,
		DollarSign,
		ArrowRight,
		XCircle
	} from 'lucide-svelte';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Sign In - Recurrr</title>
	<meta name="description" content="Sign in to your Recurrr account to manage your subscriptions" />
</svelte:head>

<div
	class="hero from-base-200 via-base-100 to-base-200 relative min-h-screen overflow-hidden bg-gradient-to-br"
>
	<!-- Animated background elements -->
	<div class="absolute inset-0 opacity-5">
		<div
			class="bg-primary absolute top-1/4 left-10 h-96 w-96 animate-pulse rounded-full mix-blend-multiply blur-3xl filter"
			style="animation-duration: 4s;"
		></div>
		<div
			class="bg-secondary absolute right-10 bottom-1/4 h-96 w-96 animate-pulse rounded-full mix-blend-multiply blur-3xl filter"
			style="animation-duration: 6s; animation-delay: 2s;"
		></div>
	</div>

	<div class="hero-content relative z-10 flex-col lg:flex-row-reverse">
		<!-- Left side - Welcome content -->
		<div class="animate-slideInRight text-center lg:ml-12 lg:text-left">
			<div class="overflow-hidden">
				<h1
					class="from-primary via-secondary to-accent animate-fadeInUp bg-gradient-to-r bg-clip-text text-4xl font-black text-transparent lg:text-6xl"
				>
					Welcome back to Recurrr!
				</h1>
			</div>
			<div class="overflow-hidden">
				<p class="animate-fadeInUp py-6 text-lg opacity-80" style="animation-delay: 0.2s;">
					Take control of your subscription expenses.
					<br class="hidden lg:block" />
					<span class="text-primary font-semibold"
						>Track, manage, and optimize your recurring payments with ease.</span
					>
				</p>
			</div>

			<!-- Feature highlights -->
			<div class="animate-fadeInUp hidden grid-cols-1 gap-3 lg:grid" style="animation-delay: 0.4s;">
				<div
					class="bg-base-100 bg-opacity-50 border-base-300 hover:border-primary flex items-center gap-3 rounded-lg border p-3 backdrop-blur-sm transition-all duration-300"
				>
					<div class="text-primary">
						<CheckCircle class="h-5 w-5" />
					</div>
					<span class="text-sm font-medium">Never miss a payment deadline</span>
				</div>
				<div
					class="bg-base-100 bg-opacity-50 border-base-300 hover:border-secondary flex items-center gap-3 rounded-lg border p-3 backdrop-blur-sm transition-all duration-300"
				>
					<div class="text-secondary">
						<TrendingUp class="h-5 w-5" />
					</div>
					<span class="text-sm font-medium">Visualize spending patterns</span>
				</div>
				<div
					class="bg-base-100 bg-opacity-50 border-base-300 hover:border-accent flex items-center gap-3 rounded-lg border p-3 backdrop-blur-sm transition-all duration-300"
				>
					<div class="text-accent">
						<DollarSign class="h-5 w-5" />
					</div>
					<span class="text-sm font-medium">Optimize your expenses</span>
				</div>
			</div>
		</div>

		<!-- Right side - Login form -->
		<div
			class="card bg-base-100 bg-opacity-90 border-base-300 animate-slideInLeft w-full max-w-sm shrink-0 border shadow-2xl backdrop-blur-lg"
		>
			<div class="card-body">
				<div class="mb-6 text-center">
					<h2
						class="from-primary to-secondary bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent"
					>
						Sign In
					</h2>
				</div>

				{#if form?.message}
					<div class="alert alert-error mb-4">
						<XCircle class="h-6 w-6 shrink-0" />
						<span>{form.message}</span>
					</div>
				{/if}

				<form method="post" action="?/login" use:enhance class="space-y-5">
					<div class="form-control group">
						<label class="label" for="username">
							<span class="label-text font-medium">Username *</span>
						</label>
						<input
							id="username"
							name="username"
							type="text"
							required
							placeholder="Enter your username"
							class="input input-bordered focus:input-primary group-hover:border-primary w-full transition-all duration-200"
						/>
					</div>

					<div class="form-control group">
						<label class="label" for="password">
							<span class="label-text font-medium">Password *</span>
						</label>
						<input
							id="password"
							name="password"
							type="password"
							required
							placeholder="Enter your password"
							class="input input-bordered focus:input-primary group-hover:border-primary w-full transition-all duration-200"
						/>
					</div>

					<div class="form-control mt-8">
						<button
							type="submit"
							class="btn btn-primary btn-lg group w-full transition-all duration-200 hover:scale-105"
						>
							<span class="transition-transform duration-200 group-hover:scale-110">Sign In</span>
							<ArrowRight
								class="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
							/>
						</button>
					</div>
				</form>

				<p class="mt-2 text-center text-sm opacity-70">
					New to Recurrr?
					<a
						href="/register"
						class="link link-primary hover:link-secondary transition-colors duration-200"
						>Create account</a
					>
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slideInLeft {
		from {
			opacity: 0;
			transform: translateX(-50px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes slideInRight {
		from {
			opacity: 0;
			transform: translateX(50px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.animate-fadeInUp {
		animation: fadeInUp 0.8s ease-out forwards;
		opacity: 0;
		animation-fill-mode: forwards;
	}

	.animate-slideInLeft {
		animation: slideInLeft 0.8s ease-out forwards;
		opacity: 0;
		animation-fill-mode: forwards;
	}

	.animate-slideInRight {
		animation: slideInRight 0.8s ease-out forwards;
		opacity: 0;
		animation-fill-mode: forwards;
		animation-delay: 0.3s;
	}
</style>
