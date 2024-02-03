<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import ProfileDetails from '$lib/components/ProfileDetails.svelte';
	import type { ProfileData } from '$lib/data/data';
	import type { Unsubscriber } from 'svelte/store';
	import ProfileStore from '../../../../stores/ProfileStore';

	let currentProfileData: ProfileData | null = null;
	let unSubscribe: Unsubscriber;

	onMount(() => {
		// select first tab
		const button = document.querySelector('#profile-tab') as HTMLButtonElement;

		button.click();

		unSubscribe = ProfileStore.subscribe((profile) => {
			if (profile) {
				currentProfileData = profile;
			}
		});
	});

	onDestroy(() => {
		if (unSubscribe) {
			unSubscribe();
		}
	});
</script>

<div class="page">
	<div class="page-top">
		<h1>My Profile</h1>
	</div>

	<div class="page-middle">
		<div class="row">
			<div class="col-12">
				<ul class="nav nav-tabs" id="myTab" role="tablist">
					<li class="nav-item" role="presentation">
						<button
							class="nav-link"
							id="profile-tab"
							data-bs-toggle="tab"
							data-bs-target="#profile"
							type="button"
							role="tab"
							aria-controls="profile"
							aria-selected="false">Details</button
						>
					</li>
				</ul>
				<div class="tab-content pt-4" id="myTabContent">
					<div class="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
						<ProfileDetails profileData={currentProfileData} />
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.tab-content {
		padding: 1rem;
		border-left: 1px solid $light-grey-color;
		border-right: 1px solid $light-grey-color;
		border-bottom: 1px solid $light-grey-color;
	}
</style>
