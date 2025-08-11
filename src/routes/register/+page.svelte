<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { Plus, Check, Lock, Zap, XCircle, Eye, EyeOff } from 'lucide-svelte';

	let { form }: { form: ActionData } = $props();

	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
</script>

<svelte:head>
	<title>Create Account - Recurrr</title>
	<meta
		name="description"
		content="Create your free Recurrr account to start tracking your subscriptions"
	/>
</svelte:head>

<div
	class="hero from-base-200 via-base-100 to-base-200 relative min-h-screen overflow-hidden bg-gradient-to-br"
>
	<!-- Animated background elements -->
	<div class="absolute inset-0 opacity-5">
		<div
			class="bg-secondary absolute top-1/4 right-10 h-96 w-96 animate-pulse rounded-full mix-blend-multiply blur-3xl filter"
			style="animation-duration: 5s;"
		></div>
		<div
			class="bg-accent absolute bottom-1/4 left-10 h-96 w-96 animate-pulse rounded-full mix-blend-multiply blur-3xl filter"
			style="animation-duration: 7s; animation-delay: 1s;"
		></div>
	</div>

	<div class="hero-content relative z-10 flex-col lg:flex-row">
		<!-- Left side - Welcome content -->
		<div class="animate-slideInLeft text-center lg:mr-12 lg:text-left">
			<div class="overflow-hidden">
				<h1
					class="from-secondary via-accent to-primary animate-fadeInUp bg-gradient-to-r bg-clip-text text-4xl font-black text-transparent lg:text-6xl"
				>
					Join Recurrr!
				</h1>
			</div>
			<div class="overflow-hidden">
				<p class="animate-fadeInUp py-6 text-lg opacity-80" style="animation-delay: 0.2s;">
					Start your journey to better subscription management.
					<br class="hidden lg:block" />
					<span class="text-secondary font-semibold"
						>Create your free account and take control today.</span
					>
				</p>
			</div>

			<!-- Benefits list -->
			<div class="animate-fadeInUp hidden grid-cols-1 gap-3 lg:grid" style="animation-delay: 0.4s;">
				<div
					class="bg-base-100 bg-opacity-50 border-base-300 hover:border-secondary flex items-center gap-3 rounded-lg border p-3 backdrop-blur-sm transition-all duration-300"
				>
					<div class="text-secondary">
						<Check class="h-5 w-5" />
					</div>
					<span class="text-sm font-medium">Free forever - no hidden costs</span>
				</div>
				<div
					class="bg-base-100 bg-opacity-50 border-base-300 hover:border-accent flex items-center gap-3 rounded-lg border p-3 backdrop-blur-sm transition-all duration-300"
				>
					<div class="text-accent">
						<Lock class="h-5 w-5" />
					</div>
					<span class="text-sm font-medium">Secure and private data</span>
				</div>
				<div
					class="bg-base-100 bg-opacity-50 border-base-300 hover:border-primary flex items-center gap-3 rounded-lg border p-3 backdrop-blur-sm transition-all duration-300"
				>
					<div class="text-primary">
						<Zap class="h-5 w-5" />
					</div>
					<span class="text-sm font-medium">Get started in under 30 seconds</span>
				</div>
			</div>
		</div>

		<!-- Right side - Registration form -->
		<div
			class="card bg-base-100 bg-opacity-90 border-base-300 animate-slideInRight w-full max-w-sm shrink-0 border shadow-2xl backdrop-blur-lg"
		>
			<div class="card-body">
				<div class="mb-6 text-center">
					<h2
						class="from-secondary to-accent bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent"
					>
						Create Account
					</h2>
				</div>

				{#if form?.message}
					<div class="alert alert-error mb-4">
						<XCircle class="h-6 w-6 shrink-0" />
						<span>{form.message}</span>
					</div>
				{/if}

				<form method="post" use:enhance class="space-y-5">
					<div class="form-control group">
						<label class="label" for="username">
							<span class="label-text font-medium">Username *</span>
						</label>
						<input
							id="username"
							name="username"
							type="text"
							required
							placeholder="Choose a unique username"
							class="input input-bordered focus:input-secondary group-hover:border-secondary w-full transition-all duration-200"
						/>
						<div class="label">
							<span class="label-text-alt opacity-60"
								>3-31 characters, alphanumeric with dashes/underscores</span
							>
						</div>
					</div>

					<div class="form-control group">
						<label class="label" for="password">
							<span class="label-text font-medium">Password *</span>
						</label>
						<div class="relative">
							<input
								id="password"
								name="password"
								type={showPassword ? 'text' : 'password'}
								required
								placeholder="Create a secure password"
								class="input input-bordered focus:input-secondary group-hover:border-secondary w-full pr-12 transition-all duration-200"
							/>
							<button
								type="button"
								class="text-base-content/60 hover:text-base-content absolute top-1/2 right-3 -translate-y-1/2 transition-colors duration-200"
								onclick={() => (showPassword = !showPassword)}
								aria-label={showPassword ? 'Hide password' : 'Show password'}
							>
								{#if showPassword}
									<EyeOff class="h-5 w-5" />
								{:else}
									<Eye class="h-5 w-5" />
								{/if}
							</button>
						</div>
						<div class="label">
							<span class="label-text-alt opacity-60">Minimum 6 characters for security</span>
						</div>
					</div>

					<div class="form-control group">
						<label class="label" for="confirmPassword">
							<span class="label-text font-medium">Confirm Password *</span>
						</label>
						<div class="relative">
							<input
								id="confirmPassword"
								name="confirmPassword"
								type={showConfirmPassword ? 'text' : 'password'}
								required
								placeholder="Confirm your password"
								class="input input-bordered focus:input-secondary group-hover:border-secondary w-full pr-12 transition-all duration-200"
							/>
							<button
								type="button"
								class="text-base-content/60 hover:text-base-content absolute top-1/2 right-3 -translate-y-1/2 transition-colors duration-200"
								onclick={() => (showConfirmPassword = !showConfirmPassword)}
								aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
							>
								{#if showConfirmPassword}
									<EyeOff class="h-5 w-5" />
								{:else}
									<Eye class="h-5 w-5" />
								{/if}
							</button>
						</div>
						<div class="label">
							<span class="label-text-alt opacity-60">Must match your password</span>
						</div>
					</div>

					<div class="form-control mt-8">
						<button
							type="submit"
							class="btn btn-secondary btn-lg group w-full transition-all duration-200 hover:scale-105"
						>
							<Plus class="mr-2 h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
							<span class="transition-transform duration-200 group-hover:scale-110"
								>Create Account</span
							>
						</button>
					</div>
				</form>

				<p class="mt-2 text-center text-sm opacity-70">
					Already have an account?
					<a
						href="/login"
						class="link link-secondary hover:link-accent transition-colors duration-200">Sign in</a
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
		animation-delay: 0.3s;
	}

	.animate-slideInRight {
		animation: slideInRight 0.8s ease-out forwards;
		opacity: 0;
		animation-fill-mode: forwards;
	}
</style>
