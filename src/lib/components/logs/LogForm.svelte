<script lang="ts">
	import type { Category, Log } from '$lib/data/data';
	import { APIS, HTTP_METHOD, fetchData, getCurrentModalReference } from '$lib/helpers/utils';
	import { afterUpdate, onMount } from 'svelte';
	import CategorySelector from '../CategorySelector.svelte';

	export let logData: Log;

	let form = {
		name: '',
		value: 0,
		categoryId: <number | null>null,
		description: null,
		recordId: 0,
		userId: 0
	};

	let isValidForm = false;

	const validationErrors = {
		name: {
			message: ''
		},
		value: {
			message: ''
		},
		category: {
			message: ''
		}
	};

	let allUserCategories: Category[] = [];

	onMount(() => {
		init();
	});

	afterUpdate(() => {
		checkForm();
	});

	function init() {
		setup();
	}

	function setup() {
		form = Object.assign(form, logData);

		getAllUserCategories(form.userId);

		validateForm();
	}

	function checkForm() {
		getCurrentModalReference().then((modalReference) => {
			if (modalReference) {
				modalReference.$set({ disabledButton: !isValidForm });
				modalReference.$set({ result: form });
			}
		});
	}

	function validateForm() {
		isValidForm = true;

		if (!form.name || form.name === '') {
			validationErrors.name.message = 'Name is required';
			isValidForm = false;
		} else {
			validationErrors.name.message = '';
		}

		if (isNaN(form.value) || form.value === null || form.value === undefined) {
			validationErrors.value.message = 'Value should be a number';
			isValidForm = false;
		} else {
			validationErrors.value.message = '';
		}

		if (!form.categoryId) {
			validationErrors.category.message = 'A category is required';
			isValidForm = false;
		} else {
			validationErrors.category.message = '';
		}
	}

	function getAllUserCategories(userId: number) {
		fetchData(
			HTTP_METHOD.GET,
			APIS.CATEGORIES + `/${userId}?PageNumber=1&PageSize=1000`,
			null
		).then((resp) => {
			if (resp) {
				allUserCategories = resp.data;
			}
		});
	}

	function onCategoryChange($event: CustomEvent<Category>) {
		if ($event.detail) {
			form.categoryId = $event.detail.id;
		} else {
			form.categoryId = null;
		}

		validateForm();
	}
</script>

<form class="form-container">
	<div class="row">
		<div class="col-6">
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
					<div class="alert alert-danger" role="alert">
						{validationErrors.name.message}
					</div>
				{/if}
			</div>
		</div>

		<div class="col-6">
			<div class="mb-3">
				<label for="value" class="form-label">Initial Value</label>
				<input
					type="number"
					class="form-control"
					id="value"
					step="0.01"
					bind:value={form.value}
					on:input={() => validateForm()}
				/>

				{#if validationErrors.value.message}
					<div class="alert alert-danger" role="alert">
						{validationErrors.value.message}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-6">
			<div class="mb-3">
				<CategorySelector
					categories={allUserCategories}
					on:selectedCategory={onCategoryChange}
					selectedCategoryId={form.categoryId}
				/>

				{#if validationErrors.category.message}
					<div class="alert alert-danger" role="alert">
						{validationErrors.category.message}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-12">
			<div class="mb-3">
				<label for="description" class="form-label">Description</label>
				<textarea class="form-control" id="description" rows="3" bind:value={form.description} />
			</div>
		</div>
	</div>
</form>
