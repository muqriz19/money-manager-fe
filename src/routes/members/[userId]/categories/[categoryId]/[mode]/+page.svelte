<script lang="ts">
	import { APIS, HTTP_METHOD, fetchData, getData } from '$lib/helpers/utils';
	import { onMount } from 'svelte';
	import { StorageItems, type SelectedIcon } from '$lib/data/core';
	import IconPicker from '$lib/components/IconPicker.svelte';
	import type { Category, ProfileData } from '$lib/data/data';
	import ToastStore from '../../../../../../stores/ToastStore.js';
	import ProfileStore from '../../../../../../stores/ProfileStore.js';

	export let data;
	let mode = data.mode;

	let userProfile: ProfileData | null = null;

	let form = {
		id: 0,
		name: <string | null>null,
		description: <string | null>null,
		icon: <SelectedIcon | null>null,
		createdDate: new Date(),
		userId: 0
	};

	let validationErrors = {
		name: {
			message: ''
		},
		icon: {
			message: ''
		}
	};

	let isValidForm = false;

	onMount(() => {
		init();
	});

	function init() {
		ProfileStore.subscribe((profile) => {
			if (profile) {
				userProfile = profile;

				form.userId = userProfile.userId;
			}
		});

		if (mode === 'edit') {
			let category = getData(StorageItems.Categories);

			form.id = category.id;
			form.name = category.name;
			form.description = category.description;
			form.icon = {
				name: category.iconName,
				set: category.iconSet
			};
		}

		validateForm();
	}

	function cancel() {
		history.back();
	}

	function validateForm() {
		// default initials
		isValidForm = true;
		validationErrors.name.message = '';
		validationErrors.icon.message = '';

		if (!form.name || form.name === '') {
			validationErrors.name.message = 'Name is required';
			isValidForm = false;
		}

		if (!form?.icon || form.icon?.name === '') {
			validationErrors.icon.message = 'Icon is required';
			isValidForm = false;
		}

		if (isValidForm) {
			validationErrors.name.message = '';
			validationErrors.icon.message = '';
			isValidForm = true;
		}
	}

	function returnFinalFormData() {
		const createdDate = mode === 'new' ? new Date() : form.createdDate;
		const description = form.description === '' ? null : form.description;

		const finalForm: Category = {
			id: form.id,
			name: form.name!,
			description,
			createdDate,
			iconName: form.icon!.name,
			iconSet: form.icon!.set,
			userId: form.userId
		};

		return finalForm;
	}

	function onSubmit() {
		const finalForm = returnFinalFormData();

		if (mode === 'new') {
			fetchData<Category>(HTTP_METHOD.POST, APIS.CATEGORIES, finalForm)
				.then((resp) => {
					ToastStore.set({
						title: 'Created Account',
						message: resp.message,
						type: 'success'
					});

					resetForm();
				})
				.catch((err) => {
					ToastStore.set({
						title: 'Error occured',
						message: err.message,
						type: 'error'
					});
				});
		} else {
			fetchData(HTTP_METHOD.PUT, APIS.CATEGORIES, finalForm)
				.then((resp) => {
					ToastStore.set({
						title: 'Updated Category',
						message: resp.message,
						type: 'success'
					});
				})
				.catch((err) => {
					ToastStore.set({
						title: 'Error occured',
						message: err.message,
						type: 'error'
					});
				});
		}
	}

	const onIconChanged = (eventSelectedIcon: CustomEvent<SelectedIcon | null>) => {
		form.icon = eventSelectedIcon?.detail;

		validateForm();

		return null;
	};

	function resetForm() {
		form = {
			id: 0,
			name: <string | null>null,
			description: <string | null>null,
			icon: <SelectedIcon | null>null,
			createdDate: new Date(),
			userId: userProfile!.userId
		};

		validationErrors = {
			name: {
				message: ''
			},
			icon: {
				message: ''
			}
		};

		isValidForm = false;

		validateForm();
	}
</script>

<div class="page">
	{#if mode === 'new'}
		<h1>New Category</h1>
		<p>Create your category</p>
	{:else}
		<h1>Edit Category</h1>
		<p>Edit your category</p>
	{/if}

	<form class="form-container" on:submit|preventDefault={onSubmit}>
		<div class="mb-3">
			<label for="name" class="form-label">Name</label>
			<input
				type="text"
				class="form-control"
				id="name"
				bind:value={form.name}
				on:input={() => validateForm()}
			/>

			{#if validationErrors.name.message !== ''}
				<div class="alert alert-danger" role="alert">{validationErrors.name.message}</div>
			{/if}
		</div>

		<div class="mb-3">
			<label for="description" class="form-label">Description</label>
			<textarea class="form-control" id="description" rows="3" bind:value={form.description} />
		</div>

		<div class="mb-3">
			<label for="description" class="form-label">Icon</label>
			<IconPicker on:iconChanged={onIconChanged} selectedIcon={form?.icon} />

			{#if validationErrors.icon.message !== ''}
				<div class="alert alert-danger" role="alert">{validationErrors.icon.message}</div>
			{/if}
		</div>

		<div class="mb-3">
			<button type="submit" class="btn btn-primary mb-3" disabled={!isValidForm}>Save</button>
			<button type="button" class="btn btn-primary mb-3" on:click={cancel}>Cancel</button>
		</div>
	</form>
</div>
