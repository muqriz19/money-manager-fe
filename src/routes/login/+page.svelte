<script lang="ts">
	import type { Login } from '$lib/data/data';
	import { APIS, HTTP_METHOD, fetchData, navigateTo, saveData } from '$lib/helpers/utils';
	import { onMount } from 'svelte';
	import ToastStore from '../../stores/ToastStore';
	import ProfileStore from '../../stores/ProfileStore';
	import { StorageItems } from '$lib/data/core';

	const form = {
		name: null,
		password: null
	};

	const validationErrors = {
		name: {
			message: ''
		},
		password: {
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
		isValidForm = true;

		if (!form.name || form.name === '') {
			validationErrors.name.message = 'Name is required';
			isValidForm = false;
		} else {
			validationErrors.name.message = '';
		}

		if (!form.password) {
			validationErrors.password.message = 'Password is required';
			isValidForm = false;
		} else {
			validationErrors.password.message = '';
		}
	}

	function returnFinalFormData() {
		const finalForm: Login = {
			name: form.name!,
			password: form.password!
		};

		return finalForm;
	}

	function onSubmit() {
		const finalForm = returnFinalFormData();

		fetchData<Login>(HTTP_METHOD.POST, APIS.Login, finalForm)
			.then((resp) => {
				ToastStore.set({
					title: 'Login success',
					message: 'Authorized',
					type: 'success'
				});

				// save profile data
				ProfileStore.set(resp.data);
				saveData(resp.data, StorageItems.Profile);

				// navigate inside
				navigateTo('/profile');
			})
			.catch((err) => {
				ToastStore.set({
					title: 'Error occured',
					message: err.message,
					type: 'error'
				});
			});
	}
</script>

<div class="page">
	<h1>Login</h1>
	<p>Login to access</p>

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
			<label for="password" class="form-label">Password</label>
			<input
				type="password"
				class="form-control"
				id="password"
				bind:value={form.password}
				on:input={() => validateForm()}
			/>

			{#if validationErrors.password.message}
				<div class="alert alert-danger" role="alert">
					{validationErrors.password.message}
				</div>
			{/if}
		</div>

		<div class="mb-3">
			<button type="submit" class="btn btn-primary mb-3" disabled={!isValidForm}>Login</button>
			<button type="button" class="btn btn-primary mb-3" on:click={cancel}>Cancel</button>

			<a
				href="/forgot-password"
				class="d-flex justify-content-end"
				style="width: fit-content;
			margin-left: auto;">Forgot your password? Click here</a
			>

			<a
				href="/register"
				class="d-flex justify-content-end"
				style="width: fit-content;
		margin-left: auto;">Don't have an account? Click here</a
			>
		</div>
	</form>
</div>
