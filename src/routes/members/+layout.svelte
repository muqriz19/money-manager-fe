<script lang="ts">
	import ProfileStore from '../../stores/ProfileStore';
	import { getData } from '$lib/helpers/utils';
	import { StorageItems } from '$lib/data/core';
	import { redirect } from '@sveltejs/kit';
	import ToastStore from '../../stores/ToastStore';
	import { onMount } from 'svelte';
	import type { ProfileData } from '$lib/data/data';

	onMount(() => {
		const profileData = getData(StorageItems.Profile);

		ProfileStore.set(profileData);
		checkIfLoggedIn(profileData);
	});

	function checkIfLoggedIn(profileData: ProfileData) {
		if (!profileData || !profileData?.token) {
			ToastStore.set({
				message: 'Session expired/doesnt exist, please re-login',
				title: 'Expired',
				type: 'error'
			});

			redirect(303, '/login');
		}
	}
</script>

<slot />
