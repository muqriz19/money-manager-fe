<script lang="ts">
	import type { User } from '$lib/data/data';
	import { APIS, HTTP_METHOD, fetchData, navigateTo } from '$lib/helpers/utils';
	import { onMount } from 'svelte';
	import ToastStore from '../../stores/ToastStore';

	const form = {
		name: null,
		email: <string | null>null,
		password: null,
		confirmPassword: null,
		createdDate: null || new Date()
	};

	const validationErrors = {
		name: {
			message: ''
		},
		email: {
			message: '',
			message2: ''
		},
		password: {
			message: ''
		},
		confirmPassword: {
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

		if (!form.name || form.name === '') {
			validationErrors.name.message = 'Name is required';
			isValidForm = false;
		} else {
			validationErrors.name.message = '';
		}

		if (form.email === null) {
			validationErrors.email.message = 'Email is required';
			isValidForm = false;
		} else {
			validationErrors.email.message = '';
		}

		if (form.email && !form.email.match(emailRegex)) {
			validationErrors.email.message2 = 'Valid email is required';
			isValidForm = false;
		} else {
			validationErrors.email.message2 = '';
		}

		if (!form.password) {
			validationErrors.password.message = 'Password is required';
			isValidForm = false;
		} else {
			validationErrors.password.message = '';
		}

		if (form?.password !== form?.confirmPassword) {
			validationErrors.confirmPassword.message = 'Password is not the same';
			isValidForm = false;
		} else {
			validationErrors.confirmPassword.message = '';
		}
	}

	function returnFinalFormData() {
		const finalForm: User = {
			name: form.name!,
			email: form.email!,
			password: form.password!,
			createdDate: new Date()
		};

		return finalForm;
	}

	function onSubmit() {
		const finalForm = returnFinalFormData();

		fetchData<User>(HTTP_METHOD.POST, APIS.REGISTER, finalForm)
			.then((resp) => {
				ToastStore.set({
					title: 'Registered',
					message: resp.message,
					type: 'success'
				});

				navigateTo('/login');
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
	<h1>Register</h1>
	<p>Create a login account</p>

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
			<label for="email" class="form-label">Email</label>
			<input
				type="email"
				class="form-control"
				id="email"
				bind:value={form.email}
				on:input={() => validateForm()}
			/>

			{#if validationErrors.email.message}
				<div class="alert alert-danger" role="alert">
					{validationErrors.email.message}
				</div>
			{/if}

			{#if validationErrors.email.message2}
				<div class="alert alert-danger" role="alert">
					{validationErrors.email.message2}
				</div>
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
			<label for="confirmPassword" class="form-label">Confirm Password</label>
			<input
				type="password"
				class="form-control"
				id="confirmPassword"
				bind:value={form.confirmPassword}
				on:input={() => validateForm()}
			/>

			{#if validationErrors.confirmPassword.message}
				<div class="alert alert-danger" role="alert">
					{validationErrors.confirmPassword.message}
				</div>
			{/if}
		</div>

		<div class="mb-3">
			<button type="submit" class="btn btn-primary mb-3" disabled={!isValidForm}>Save</button>
			<button type="button" class="btn btn-primary mb-3" on:click={cancel}>Cancel</button>

			<a href="/forgot-password" class="d-flex justify-content-end"
				>Already registered but forgot password, click here</a
			>
		</div>
	</form>
</div>

<style lang="scss">
	a {
		width: fit-content;
		margin-left: auto;
	}
</style>
