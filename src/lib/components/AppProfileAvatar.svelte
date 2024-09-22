<script lang="ts">
	import defaultUserAvatar from '$lib/assets/images/user.svg';
	import { clearStorage, debounce } from '$lib/helpers/utils';
	import { onMount } from 'svelte';
	import ProfileStore from '../../stores/ProfileStore';
	import type { RouteItem } from '$lib/data/core';
	import type { ProfileData } from '$lib/data/data';
	import { page } from '$app/stores';

	let randomId = 0;
	let dropdown = {
		x: 0,
		y: 0,
		visible: false
	};

	let currentRoute = '';

	const profileLinks: RouteItem[] = [
		{
			path: '/members/profile',
			name: 'Profile'
		},
		{
			path: '/login',
			name: 'Login'
		},
		{
			path: '/login',
			name: 'Logout',
			command: ($event: any) => {
				logOut();
			}
		}
	];

	let allAllowedLinks: RouteItem[] = [];

	let currentProfileData: ProfileData | null;

	onMount(() => {
		init();
	});

	function init() {
		randomId = Math.floor(Math.random() * 100) + 1;

		addEventListener('resize', () => {
			reset();
		});

		ProfileStore.subscribe((profileData) => {
			if (profileData && profileData.token !== '') {
				currentProfileData = profileData;
				allAllowedLinks = profileLinks.filter((link) => link.name !== 'Login');

				allAllowedLinks[0].path = `/members/${profileData?.userId}/profile`;
				currentRoute = `/members/${profileData?.userId}/profile`;
			} else {
				allAllowedLinks = profileLinks.filter(
					(link) => link.name !== 'Logout' && link.name !== 'Profile'
				);
			}
		});
	}

	function reset() {
		dropdown.x = 0;
		dropdown.y = 0;
		dropdown.visible = false;
	}

	function onProfileClick() {
		positionCorrectly();
	}

	function positionCorrectly() {
		const dropDownElement = document.querySelector(`[data-list-id="list-${randomId}"]`);

		const documentScreen = {
			right: document.body.clientWidth,
			left: document.body.clientLeft
		};

		const rectDropDown = dropDownElement?.getClientRects();

		debounce(0, () => {
			if (rectDropDown && rectDropDown.item(0)) {
				const rectDropDownItem = rectDropDown.item(0)!;

				if (rectDropDownItem.right > documentScreen.right) {
					dropdown.x = -120;
				}
			}

			dropdown.visible = true;
		});
	}

	function logOut() {
		ProfileStore.set(null);
		clearStorage();
		currentProfileData = null;
	}

	function getCurrentRoute(path: string) {
		currentRoute = path;
	}

	$: getCurrentRoute($page.url.pathname);
</script>

<div class="dropdown">
	<button
		class="btn btn-secondary dropdown-toggle"
		type="button"
		data-bs-toggle="dropdown"
		aria-expanded="false"
		on:click={onProfileClick}
	>
		<img src={defaultUserAvatar} alt="Your profile avatar" />
	</button>
	<ul
		class="dropdown-menu"
		data-list-id="list-{randomId}"
		style="left: {dropdown.x}px; visibility: {dropdown.visible ? 'visible' : 'hidden'}"
	>
		{#if currentProfileData && currentProfileData?.name}
			<li><div class="dropdown-item">Hello, {currentProfileData.name}</div></li>
		{/if}

		{#each allAllowedLinks as link}
			{#if link?.command}
				<li class="nav-link {currentRoute === link.path ? 'active' : ''}">
					<a class="dropdown-item" href={link.path} on:click={link.command}>{link.name}</a>
				</li>
			{:else}
				<li class="nav-link {currentRoute === link.path ? 'active' : ''}">
					<a class="dropdown-item" href={link.path}>{link.name}</a>
				</li>
			{/if}
		{/each}
	</ul>
</div>

<style lang="scss">
	.active {
		background-color: $green-color;
		a {
			color: $white-color;
		}
	}

	button {
		border-radius: 100%;
		display: flex;

		height: 32px;
		width: 32px;
		position: relative;

		img {
			position: relative;
			top: 50%;
			left: 50%;
			width: 20px;
			-webkit-transform: translate(-50%, -50%);
			-ms-transform: translate(-50%, -50%);
			transform: translate(-50%, -50%);
		}
	}

	// remove dropdown icon
	.dropdown-toggle::after {
		display: none;
	}
</style>
