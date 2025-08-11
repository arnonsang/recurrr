<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Plus, Palette, LogOut, BarChart3, CreditCard } from 'lucide-svelte';

	let { children } = $props();

	let user = $derived($page.data.user);

	// Theme management
	let selectedTheme = $state('light');

	// Load theme from localStorage on mount
	onMount(() => {
		if (browser) {
			const savedTheme = localStorage.getItem('recurrr-theme');
			if (savedTheme) {
				selectedTheme = savedTheme;
				applyTheme(savedTheme);
			} else {
				// Set default theme
				applyTheme('light');
			}
		}
	});

	// Apply theme to document
	function applyTheme(theme: string) {
		if (browser) {
			document.documentElement.setAttribute('data-theme', theme);
			selectedTheme = theme;
			localStorage.setItem('recurrr-theme', theme);
		}
	}

	// Handle theme change
	function handleThemeChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target && target.checked) {
			applyTheme(target.value);
		}
	}
</script>

{#if user}
	<!-- Minimal Top Navigation -->
	<div class="navbar bg-base-100 border-base-200 border-b">
		<div class="navbar-start">
			<a href="/dashboard" class="btn btn-ghost text-xl font-bold"> Recurrr </a>
		</div>

		<div class="navbar-center hidden sm:flex">
			<ul class="menu menu-horizontal gap-2 px-1">
				<li>
					<a
						href="/dashboard"
						class="btn btn-ghost btn-sm {$page.url.pathname === '/dashboard' ? 'btn-active' : ''}"
					>
						Dashboard
					</a>
				</li>
				<li>
					<a
						href="/subscriptions"
						class="btn btn-ghost btn-sm {$page.url.pathname.startsWith('/subscriptions')
							? 'btn-active'
							: ''}"
					>
						Subscriptions
					</a>
				</li>
			</ul>
		</div>

		<div class="navbar-end gap-2">
			<a href="/subscriptions/add" class="btn btn-primary btn-sm">
				<Plus class="h-4 w-4" />
				<span class="hidden sm:inline">Add</span>
			</a>

			<!-- Theme Switcher -->
			<details class="dropdown dropdown-end">
				<summary class="btn btn-ghost btn-sm btn-square" aria-label="Change theme">
					<Palette class="h-4 w-4" />
				</summary>
				<div
					class="dropdown-content bg-base-100 rounded-box border-base-200 z-[1] max-h-96 w-64 overflow-y-auto border p-3 shadow-lg"
				>
					<div class="mb-3 text-sm font-medium">Choose Theme</div>

					<!-- Popular Themes -->
					<div class="mt-4 mb-2 text-xs font-medium opacity-70">Popular</div>
					<div class="flex flex-col space-y-1">
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Light</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="light"
								checked={selectedTheme === 'light'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Dark</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="dark"
								checked={selectedTheme === 'dark'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Cupcake</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="cupcake"
								checked={selectedTheme === 'cupcake'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Emerald</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="emerald"
								checked={selectedTheme === 'emerald'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Corporate</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="corporate"
								checked={selectedTheme === 'corporate'}
								onchange={handleThemeChange}
							/>
						</label>
					</div>

					<hr class="my-3" />

					<!-- Creative Themes -->
					<div class="mb-2 text-xs font-medium opacity-70">Creative</div>
					<div class="flex flex-col space-y-1">
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Retro</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="retro"
								checked={selectedTheme === 'retro'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Cyberpunk</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="cyberpunk"
								checked={selectedTheme === 'cyberpunk'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Valentine</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="valentine"
								checked={selectedTheme === 'valentine'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Fantasy</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="fantasy"
								checked={selectedTheme === 'fantasy'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Wireframe</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="wireframe"
								checked={selectedTheme === 'wireframe'}
								onchange={handleThemeChange}
							/>
						</label>
					</div>

					<hr class="my-3" />

					<!-- Nature Themes -->
					<div class="mb-2 text-xs font-medium opacity-70">Nature</div>
					<div class="flex flex-col space-y-1">
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Garden</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="garden"
								checked={selectedTheme === 'garden'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Forest</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="forest"
								checked={selectedTheme === 'forest'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Aqua</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="aqua"
								checked={selectedTheme === 'aqua'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Autumn</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="autumn"
								checked={selectedTheme === 'autumn'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Winter</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="winter"
								checked={selectedTheme === 'winter'}
								onchange={handleThemeChange}
							/>
						</label>
					</div>

					<hr class="my-3" />

					<!-- Dark Themes -->
					<div class="mb-2 text-xs font-medium opacity-70">Dark</div>
					<div class="flex flex-col space-y-1">
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Dracula</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="dracula"
								checked={selectedTheme === 'dracula'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Black</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="black"
								checked={selectedTheme === 'black'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Luxury</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="luxury"
								checked={selectedTheme === 'luxury'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Night</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="night"
								checked={selectedTheme === 'night'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Coffee</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="coffee"
								checked={selectedTheme === 'coffee'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Dim</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="dim"
								checked={selectedTheme === 'dim'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Nord</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="nord"
								checked={selectedTheme === 'nord'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Sunset</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="sunset"
								checked={selectedTheme === 'sunset'}
								onchange={handleThemeChange}
							/>
						</label>
					</div>

					<hr class="my-3" />

					<!-- Colorful Themes -->
					<div class="mb-2 text-xs font-medium opacity-70">Colorful</div>
					<div class="flex flex-col space-y-1">
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Lofi</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="lofi"
								checked={selectedTheme === 'lofi'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Pastel</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="pastel"
								checked={selectedTheme === 'pastel'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Business</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="business"
								checked={selectedTheme === 'business'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Acid</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="acid"
								checked={selectedTheme === 'acid'}
								onchange={handleThemeChange}
							/>
						</label>
						<label class="label cursor-pointer justify-between py-2">
							<span class="label-text">Lemonade</span>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller radio radio-sm"
								value="lemonade"
								checked={selectedTheme === 'lemonade'}
								onchange={handleThemeChange}
							/>
						</label>
					</div>
				</div>
			</details>

			<!-- User Menu -->
			<details class="dropdown dropdown-end">
				<summary class="btn btn-ghost btn-sm btn-circle">
					<div
						class="bg-primary text-primary-content flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium"
					>
						{user.username.charAt(0).toUpperCase()}
					</div>
				</summary>
				<ul
					class="dropdown-content menu bg-base-100 rounded-box border-base-200 z-[1] w-48 border p-2 shadow-lg"
				>
					<li class="menu-title">
						<span class="text-xs opacity-70">Signed in as</span>
						<span class="font-medium">{user.username}</span>
					</li>
					<li class="pt-2">
						<form method="post" action="/logout">
							<button type="submit" class="text-error flex w-full items-center gap-2 text-left">
								<LogOut class="h-4 w-4" />
								Sign Out
							</button>
						</form>
					</li>
				</ul>
			</details>
		</div>
	</div>

	<!-- Mobile Navigation -->
	<div class="btm-nav z-50 sm:hidden">
		<a href="/dashboard" class={$page.url.pathname === '/dashboard' ? 'active' : ''}>
			<BarChart3 class="h-5 w-5" />
			<span class="btm-nav-label">Dashboard</span>
		</a>
		<a
			href="/subscriptions"
			class={$page.url.pathname.startsWith('/subscriptions') && !$page.url.pathname.includes('/add')
				? 'active'
				: ''}
		>
			<CreditCard class="h-5 w-5" />
			<span class="btm-nav-label">Subscriptions</span>
		</a>
		<a href="/subscriptions/add" class={$page.url.pathname.includes('/add') ? 'active' : ''}>
			<Plus class="h-5 w-5" />
			<span class="btm-nav-label">Add</span>
		</a>
	</div>

	<!-- Main Content -->
	<main class="bg-base-200 min-h-screen pb-20 sm:pb-0">
		<div class="container mx-auto max-w-7xl p-4">
			{@render children()}
			<!-- PS badge -->
			<div class="bg-secondary/10 mb-4 flex items-center justify-between rounded-lg p-3">
				<div class="text-sm opacity-70">
					<span class="font-medium">Prototype</span> - Recurrr is a proof of concept app. It is not production-ready.
					No design and experience polish has been applied.
				</div>
				<a href="/feedback" class="btn btn-secondary btn-sm"> Share Feedback </a>
			</div>
		</div>
	</main>
{:else}
	{@render children()}
{/if}
