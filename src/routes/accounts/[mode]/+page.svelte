<script lang="ts">
	import { APIS, HTTP_METHOD, fetchData, getData } from '$lib/helpers/utils';
	import { onMount } from 'svelte';
	import ToastStore from '../../../stores/ToastStore';
	import { StorageItems } from '$lib/data/core';
	import type { Account } from '$lib/data/data';

	export let data;
	let mode = data.mode;

	const form = {
		id: 0,
		name: null,
		description: null,
		createdDate: null || new Date()
	};

	const validationErrors = {
		name: {
			message: ''
		}
	};

	let isValidForm = false;

	onMount(() => {
		init();
	});

	function init() {
		if (mode === 'edit') {
			let account = getData(StorageItems.Accounts);

			form.id = account.id;
			form.name = account.name;
			form.description = account.description;
		}

		validateForm();
	}

	function cancel() {
		history.back();
	}

	function validateForm() {
		if (!form.name || form.name === '') {
			validationErrors.name.message = 'Name is required';
			isValidForm = false;
		} else {
			validationErrors.name.message = '';
			isValidForm = true;
		}
	}

	function returnFinalFormData() {
		const createdDate = mode === 'new' ? new Date() : form.createdDate;
		const description = form.description === '' ? null : form.description;

		const finalForm: Account = {
			id: form.id,
			name: form.name!,
			description,
			createdDate
		};

		return finalForm;
	}

	function onSubmit() {
		const finalForm = returnFinalFormData();

		if (mode === 'new') {
			fetchData<Account>(HTTP_METHOD.POST, APIS.ACCOUNTS, finalForm)
				.then((resp) => {
					ToastStore.set({
						title: 'Created Account',
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
		} else {
			fetchData<Account>(HTTP_METHOD.PUT, APIS.ACCOUNTS, finalForm)
				.then((resp) => {
					ToastStore.set({
						title: 'Updated Account',
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
</script>

<div class="page">
	{#if mode === 'new'}
		<h1>New Accounts</h1>
		<p>Create your account</p>
	{:else}
		<h1>Edit Account</h1>
		<p>Edit your account</p>
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

			{#if validationErrors.name.message}
				<div class="alert alert-danger" role="alert">{validationErrors.name.message}</div>
			{/if}
		</div>

		<div class="mb-3">
			<label for="description" class="form-label">Description</label>
			<textarea class="form-control" id="description" rows="3" bind:value={form.description} />
		</div>

		<div class="mb-3">
			<button type="submit" class="btn btn-primary mb-3" disabled={!isValidForm}>Save</button>
			<button type="button" class="btn btn-primary mb-3" on:click={cancel}>Cancel</button>
		</div>
	</form>
</div>
