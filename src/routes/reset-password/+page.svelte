<script lang="ts">
	import type { ResetPassword } from '$lib/data/data';
	import { APIS, HTTP_METHOD, fetchData, navigateTo } from '$lib/helpers/utils';
	import { onMount } from 'svelte';
	import ToastStore from '../../stores/ToastStore';

	export let data;

	const form = {
		email: <string | null>null,
		newPassword: null,
		confirmPassword: null
	};

	const validationErrors = {
		email: {
			message: '',
			message2: ''
		},
		newPassword: {
			message: ''
		},
		confirmNewPassword: {
			message: ''
		}
	};

	let isValidForm = false;

	onMount(() => {
		init();
	});

	function init() {
		if (data) {
			if (data.email) {
				form.email = data.email;
			}
		}

		validateForm();
	}

	function cancel() {
		history.back();
	}

	function validateForm() {
		isValidForm = true;

		if (!form.email || form.email == '') {
			validationErrors.email.message = 'Email is required';
			isValidForm = false;
		} else {
			validationErrors.email.message = '';
		}

		const emailRegex =
			/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		if (form.email && !form.email.match(emailRegex)) {
			validationErrors.email.message2 = 'Valid email is required';
			isValidForm = false;
		} else {
			validationErrors.email.message2 = '';
		}

		if (!form.newPassword) {
			validationErrors.newPassword.message = 'Password is required';
			isValidForm = false;
		} else {
			validationErrors.newPassword.message = '';
		}

		if (form?.newPassword !== form?.confirmPassword) {
			validationErrors.confirmNewPassword.message = 'Password is not the same';
			isValidForm = false;
		} else {
			validationErrors.confirmNewPassword.message = '';
		}
	}

	function returnFinalFormData() {
		const finalForm: ResetPassword = {
			email: form.email!,
			newPassword: form.newPassword!
		};

		return finalForm;
	}

	function onSubmit() {
		const finalForm = returnFinalFormData();

		fetchData<ResetPassword>(HTTP_METHOD.POST, APIS.RESET_PASSWORD, finalForm)
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
	<h1>Reset Password</h1>
	<p>Key in new password</p>

	<form class="form-container" on:submit|preventDefault={onSubmit}>
		<div class="mb-3">
			<label for="email" class="form-label">Email</label>
			<input type="text" class="form-control" id="name" disabled value={form.email} />

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
				bind:value={form.newPassword}
				on:input={() => validateForm()}
			/>

			{#if validationErrors.newPassword.message}
				<div class="alert alert-danger" role="alert">
					{validationErrors.newPassword.message}
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

			{#if validationErrors.confirmNewPassword.message}
				<div class="alert alert-danger" role="alert">
					{validationErrors.confirmNewPassword.message}
				</div>
			{/if}
		</div>

		<div class="mb-3">
			<button type="submit" class="btn btn-primary mb-3" disabled={!isValidForm}>Reset</button>
			<button type="button" class="btn btn-primary mb-3" on:click={cancel}>Cancel</button>
		</div>
	</form>
</div>
