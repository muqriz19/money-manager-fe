<script lang="ts">
	import { TransactionType, type Category, type Log, type Transaction } from '$lib/data/data';
	import {
		APIS,
		HTTP_METHOD,
		fetchData,
		getCurrentModalReference,
		getEnumsValues
	} from '$lib/helpers/utils';
	import { afterUpdate, onMount } from 'svelte';
	import CategorySelector from './CategorySelector.svelte';
	import type { SelectOption } from '$lib/data/core';

	export let logData: Log;
	export let transactionData: Transaction;

	let form = {
		name: '',
		value: 0,
		categoryId: <number | null>null,
		description: null,
		recordId: 0,
		userId: 0,
		logId: 0,
		transactionType: <TransactionType>TransactionType.Income,
		createdDate: new Date()
	};

	let isValidForm = false;

	let transactionTypeOptions: SelectOption[] = [];

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
		initTransactionTypeOption();

		if (logData && transactionData === null) {
			form.recordId = logData.recordId;
			form.userId = logData.userId;
			form.logId = logData.id;
		}

		if (transactionData) {
			form = Object.assign(form, transactionData);
		}

		const userId = Object.keys(logData).length > 0 ? logData.userId : transactionData.userId;

		getAllUserCategories(userId);

		validateForm();
	}

	function initTransactionTypeOption() {
		transactionTypeOptions = Object.keys(TransactionType)
			.filter((type) => !Number.isNaN(Number(type).valueOf()))
			.map((filteredType) => {
				const enumNumber = Number(filteredType);
				const enumString = TransactionType[enumNumber];

				return {
					label: enumString,
					prop: enumNumber,
					value: enumNumber
				};
			});
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
		} else if (form.value < 0) {
			validationErrors.value.message = 'Value should be greater than zero';
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

	function onTransactionTypeSelect($event: any) {
		const value = Number($event.target.value);

		form.transactionType = value;

		return null;
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
					min="0"
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
				<label for="type" class="form-label">Type</label>

				<select
					class="form-select"
					id="type"
					aria-label="Default select example"
					value={Number(form.transactionType)}
					on:change={onTransactionTypeSelect}
				>
					{#each transactionTypeOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>
		</div>

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

	<!-- <div class="row">
		<div class="col-6">
			<div class="mb-3">
				<label for="createdDate" class="form-label">Date</label>

				<input type="date" id="createdDate" name="createdDate" class="form-control" value="{form.createdDate}"/>
			</div>
		</div>
	</div> -->

	<div class="row">
		<div class="col-12">
			<div class="mb-3">
				<label for="description" class="form-label">Description</label>
				<textarea class="form-control" id="description" rows="3" bind:value={form.description} />
			</div>
		</div>
	</div>
</form>
