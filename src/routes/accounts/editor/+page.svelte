<script lang="ts">
	import { APIS, HTTP_METHOD, fetchData } from '$lib/helpers/utils';
	import { onMount } from 'svelte';
	import ToastStore from '../../../stores/ToastStore';

	const form = {
		name: null,
		description: null,
		createdDate: null
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

	function onSubmit() {
		const finalForm = {
			...form,
			createdDate: new Date()
		};

		fetchData(HTTP_METHOD.POST, APIS.ACCOUNTS, finalForm)
			.then((resp) => {
				console.log(resp);

				ToastStore.set({
					title: "Created Account",
					message: resp.message,
					type: 'success'
				});
			})
			.catch((err) => {
				ToastStore.set({
					title: "Error occured",
					message: err.message,
					type: 'error'
				});
			});
	}
</script>

<div class="page">
	<h1>New Accounts</h1>
	<p>Create your account here</p>

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
