<script>
	import {
		DollarSign,
		RefreshCw,
		CheckCircle,
		ArrowRight,
		PlusCircle,
		MessageCircleWarning
	} from 'lucide-svelte';
</script>

<svelte:head>
	<title>Recurrr - Track Your Recurring Subscriptions</title>
	<meta
		name="description"
		content="Beautiful subscription tracking app to manage your recurring payments and expenses"
	/>
</svelte:head>

<div
	class="hero from-base-200 via-base-100 to-base-200 relative min-h-screen overflow-hidden bg-gradient-to-br"
>
	<!-- Animated background blobs -->
	<div class="absolute inset-0 opacity-10">
		<div
			class="bg-primary absolute top-20 left-10 h-32 w-32 animate-pulse rounded-full mix-blend-multiply blur-xl filter"
		></div>
		<div
			class="bg-secondary absolute top-40 right-20 h-24 w-24 animate-pulse rounded-full mix-blend-multiply blur-xl filter"
			style="animation-delay: 1s;"
		></div>
		<div
			class="bg-accent absolute bottom-32 left-1/4 h-40 w-40 animate-pulse rounded-full mix-blend-multiply blur-xl filter"
			style="animation-delay: 2s;"
		></div>
	</div>

	<div class="hero-content relative z-10 text-center">
		<div class="max-w-2xl">
			<!-- Logo (cleaned up) -->
			<div class="mb-8 flex justify-center">
				<img
					class="h-24 w-24 rounded-2xl object-cover"
					src="/recurrr-logo.jpg"
					alt="Recurrr Logo"
				/>
			</div>

			<!-- Title -->
			<h1
				class="from-primary via-secondary to-accent animate-fadeInUp bg-gradient-to-r bg-clip-text text-6xl font-black text-transparent"
				style="animation-delay: 0.2s;"
			>
				Recurrr
			</h1>

			<!-- Subtitle -->
			<p class="animate-fadeInUp py-6 text-xl opacity-80" style="animation-delay: 0.4s;">
				Beautifully track and manage your recurring subscriptions.
				<br class="hidden sm:block" />
				<span class="text-primary font-semibold">Never miss a payment again.</span>
			</p>

			<!-- Features -->
			<div
				class="animate-fadeInUp mb-10 grid grid-cols-1 gap-6 md:grid-cols-3"
				style="animation-delay: 0.6s;"
			>
				{#each [{ icon: DollarSign, title: 'Smart Tracking', desc: 'AI-powered expense insights', color: 'primary' }, { icon: RefreshCw, title: 'Auto Sync', desc: 'Seamless integration', color: 'secondary' }, { icon: CheckCircle, title: 'Never Miss', desc: 'Smart notifications', color: 'accent' }] as feature}
					<div
						class="bg-base-100 bg-opacity-50 border-base-300 hover:border-{feature.color} rounded-lg border p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105"
					>
						<div class={`text-${feature.color} mb-2`}>
							<svelte:component this={feature.icon} class="mx-auto h-6 w-6" />
						</div>
						<h3 class="mb-1 font-semibold">{feature.title}</h3>
						<p class="text-sm opacity-70">{feature.desc}</p>
					</div>
				{/each}
			</div>

			<!-- CTA -->
			<div
				class="animate-fadeInUp flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
				style="animation-delay: 0.8s;"
			>
				<a
					href="/register"
					class="btn btn-outline btn-lg w-full transition-all duration-200 hover:scale-105 sm:w-auto sm:min-w-48"
				>
					<PlusCircle
						class="mr-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
					/>
					<span class="transition-transform duration-200 group-hover:scale-110">Create Account</span
					>
				</a>
				<a href="/login" class="btn btn-primary btn-lg group w-full sm:w-auto sm:min-w-48">
					<span class="transition-transform duration-200 group-hover:scale-110">Sign In</span>
					<ArrowRight
						class="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
					/>
				</a>
			</div>

			<!-- Alert warning -->
			<div class="bg-error/5 text-error mt-8 flex items-center justify-between rounded-lg p-4">
				<div class="flex items-center gap-2">
					<MessageCircleWarning class="h-5 w-5" />
					<span class="text-sm">
						Recurrr is just a <u>prototype for proof of concept</u>. It is not a production-ready
						app.
					</span>
				</div>
				<a href="/feedback" class="btn btn-error btn-sm"> Share Feedback </a>
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

	.animate-fadeInUp {
		animation: fadeInUp 0.8s ease-out forwards;
		opacity: 0;
	}
</style>
