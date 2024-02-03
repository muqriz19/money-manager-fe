<script lang="ts">
	import type { ProfileData } from '$lib/data/data';

	export let profileData: ProfileData | null = null;

	$: currentProfileData = {
		name: profileData?.name,
		email: profileData?.email,
		createdDate: new Date(profileData ? profileData?.createdDate : new Date()).toDateString()
	};
</script>

<div class="profile-details-container">
	{#if currentProfileData}
		<div class="row">
			<div class="col-3">
				<div class="mb-3">
					<label for="name" class="form-label">Name</label>
					<input type="text" id="name" class="form-control" readonly value={currentProfileData.name} />
				</div>
			</div>

			<div class="col-3">
				<div class="mb-3">
					<label for="email" class="form-label">Email address</label>
					<input type="text" id="email" class="form-control" readonly value={currentProfileData.email} />
				</div>
			</div>

			<div class="col-3">
				<div class="mb-3">
					<label for="dateCreated" class="form-label">Joined since</label>
					<input
						type="text"
						id="dateCreated"
						class="form-control"
						readonly
						value={currentProfileData.createdDate}
					/>
				</div>
			</div>
		</div>
	{/if}
</div>
