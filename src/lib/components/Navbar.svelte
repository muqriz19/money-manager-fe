<script lang="ts">
	import type { RouteItem } from '$lib/data/core';
	import { page } from '$app/stores';

	import icon from '$lib/assets/icons/money-manager-icon.svg';
	import AppProfileAvatar from './AppProfileAvatar.svelte';
	import { onDestroy, onMount } from 'svelte';
	import ProfileStore from '../../stores/ProfileStore';

	let currentRoute: string = '';

	const allRoutes: RouteItem[] = [
		{
			path: '/',
			name: 'Home'
		},
		{
			path: 'members/accounts',
			name: 'Accounts',
			children: [
				{
					path: 'members/accounts',
					name: 'All'
				},
				{
					path: 'members/accounts/new',
					name: 'New'
				}
			]
		},
		{
			path: 'members/categories',
			name: 'Categories',
			children: [
				{
					path: 'members/categories',
					name: 'All'
				},
				{
					path: 'members/categories/new',
					name: 'New'
				}
			]
		}
	];

	let allowedRoutes: RouteItem[] = [];

	onMount(() => {
		init();
	});

	onDestroy(() => {});

	function init() {
		ProfileStore.subscribe((profileData) => {
			if (profileData && profileData.token !== '') {
				// filtered allowed
				allowedRoutes = allRoutes;
			} else {
				allowedRoutes = [allRoutes[0]];
			}
		});
	}

	function getCurrentRoute(path: string) {
		currentRoute = path;
	}

	$: getCurrentRoute($page.url.pathname);
</script>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
	<div class="container-fluid">
		<a class="navbar-brand" href="/">
			<img src={icon} alt="Money Manager" class="icon" title="Money Manager" />
		</a>
		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbarSupportedContent"
			aria-controls="navbarSupportedContent"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon" />
		</button>
		<div class="collapse navbar-collapse" id="navbarSupportedContent">
			<ul class="navbar-nav me-auto mb-2 mb-lg-0">
				{#each allowedRoutes as parentRoute}
					{#if !parentRoute?.children}
						<li class="nav-item">
							<a
								class="nav-link {currentRoute === parentRoute.path ? 'active' : ''}"
								aria-current="page"
								href={parentRoute.path}>{parentRoute.name}</a
							>
						</li>
					{:else}
						<li class="nav-item dropdown">
							<a
								class="nav-link dropdown-toggle"
								id={parentRoute.path}
								role="button"
								data-bs-toggle="dropdown"
								aria-expanded="false"
							>
								{parentRoute.name}
							</a>
							<ul class="dropdown-menu" aria-labelledby={parentRoute.path}>
								{#each parentRoute.children as child}
									<li>
										<a
											class="dropdown-item {currentRoute === child.path ? 'active' : ''}"
											href={child.path}>{child.name}</a
										>
									</li>
								{/each}
							</ul>
						</li>
					{/if}
				{/each}
			</ul>

			<AppProfileAvatar />
		</div>
	</div>
</nav>
