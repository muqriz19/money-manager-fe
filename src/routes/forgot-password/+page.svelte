<script lang="ts">
	import type { ForgotPassword } from '$lib/data/data';
	import { APIS, HTTP_METHOD, fetchData, navigateTo } from '$lib/helpers/utils';
	import { onMount } from 'svelte';
	import ToastStore from '../../stores/ToastStore';

	const form = {
		email: <string | null>null
	};

	const validationErrors = {
		email: {
			message: '',
			message2: ''
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
	}

	function returnFinalFormData() {
		const finalForm: ForgotPassword = {
			email: form.email!
		};

		return finalForm;
	}

	function onSubmit() {
		const finalForm = returnFinalFormData();

		fetchData<ForgotPassword>(HTTP_METHOD.POST, APIS.FORGOT_PASSWORD, finalForm)
			.then((resp) => {
				ToastStore.set({
					title: 'Forgot password initialised',
					message: 'Initialising resetting of password',
					type: 'success'
				});

				const pathRouteReset = `/reset-password?email=${form.email}&resetPasswordTemp=${resp.data}`;

				navigateTo(pathRouteReset);
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
	<h1>Forgot Password</h1>
	<p>Type in your email to reset your password</p>

	<form class="form-container" on:submit|preventDefault={onSubmit}>
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
			<button type="submit" class="btn btn-primary mb-3" disabled={!isValidForm}>Submit</button>
			<button type="button" class="btn btn-primary mb-3" on:click={cancel}>Cancel</button>
		</div>
	</form>
</div>
