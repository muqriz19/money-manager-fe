<script lang="ts">
	import type { Login } from '$lib/data/data';
	import { APIS, HTTP_METHOD, fetchData, navigateTo, saveData } from '$lib/helpers/utils';
	import { onMount } from 'svelte';
	import ToastStore from '../../stores/ToastStore';
	import ProfileStore from '../../stores/ProfileStore';
	import { StorageItems } from '$lib/data/core';

	const form = {
		email: <string | null>null,
		password: null
	};

	const validationErrors = {
		email: {
			message: ''
		},
		password: {
			message: ''
		}
	};

	const emailRegex =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

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

		if (!form.email || form.email === '') {
			validationErrors.email.message = 'Email is required';
			isValidForm = false;
		} else if (form.email && !form.email.match(emailRegex)) {
			validationErrors.email.message = 'A valid email is required';
		} else {
			validationErrors.email.message = '';
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
			email: form.email!,
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
				saveData(resp.data, StorageItems.Profile);
				ProfileStore.set(resp.data);

				// navigate inside
				navigateTo(`/members/${resp.data.userId}/profile`);
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
			<label for="name" class="form-label">Email</label>
			<input
				type="email"
				class="form-control"
				id="email"
				bind:value={form.email}
				on:input={() => validateForm()}
			/>

			{#if validationErrors.email.message}
				<div class="alert alert-danger" role="alert">{validationErrors.email.message}</div>
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

			<a href="/forgot-password" class="d-flex justify-content-end"
				>Forgot your password? Click here</a
			>

			<a href="/register" class="d-flex justify-content-end">Don't have an account? Click here</a>
		</div>
	</form>
</div>

<style lang="scss">
	a {
		width: fit-content;
		margin-left: auto;
	}
</style>
