<script lang="ts">
	import type { Category, ProfileData } from '$lib/data/data';
	import { clearAnyLucideIcons, createLucideIcons } from '$lib/helpers/ui';
	import { debounce, getCurrentModalReference, navigateTo } from '$lib/helpers/utils';
	import { createEventDispatcher, onMount } from 'svelte';
	import ProfileStore from '../../stores/ProfileStore';

	export const dipatch = createEventDispatcher();

	export let categories: Category[] = [];
	let filteredCategories: Category[] = [];

	let currentSelectedCategory: Category | null = null;

	let inputSearch = '';
	let lastInputSearch = '';
	let showOptions = false;

	let userProfile: ProfileData | null = null;

	onMount(() => {
		init();
		dipatchSelectedCategory(null);
	});

	function onSelectCategory(category: Category) {
		currentSelectedCategory = null;

		debounce(100, () => {
			currentSelectedCategory = category;

			clearAnyLucideIcons({ ignoreClass: ['ignoreIconOption'] }).then(() => {
				inputSearch = category.name;
				lastInputSearch = inputSearch;
				showOptions = false;

				createLucideIcons(200);

				dipatchSelectedCategory(category);
			});
		});

		return null;
	}

	function init() {
		ProfileStore.subscribe((profile) => {
			if (profile) {
				userProfile = profile;
			}
		});
	}

	function preInitSearch() {
		showOptions = true;

		filteredCategories = categories;

		createLucideIcons(100);
	}

	function postSearch() {
		debounce(200, () => {
			filteredCategories = categories;
			inputSearch = lastInputSearch;

			showOptions = false;
		});
	}

	function filterSearch() {
		if (inputSearch === '') {
			filteredCategories = categories;
		} else {
			filteredCategories = categories.filter((category) => {
				return category.name.toLowerCase().match(inputSearch.toLowerCase());
			});
		}

		clearAnyLucideIcons({ ignoreClass: ['ignoreIcon'] }).then(() => {
			createLucideIcons(300);
		});
	}

	function dipatchSelectedCategory(category: Category | null) {
		dipatch('selectedCategory', category);
	}

	function clearSelection() {
		currentSelectedCategory = null;
		debounce(300, () => {
			inputSearch = '';

			dipatchSelectedCategory(currentSelectedCategory);
			clearAnyLucideIcons({ ignoreClass: ['ignoreIconOption'] }).then(() => {
				createLucideIcons(200);
			});
		});
	}

	function openCategoryPage() {
		navigateTo(`/members/${userProfile?.userId}/categories/0/new`);

		getCurrentModalReference().then((modalReference) => {
			if (modalReference) {
				modalReference.hideModal();
			}
		});
	}
</script>

<div>
	<label for="category" class="form-label">Category</label>

	<div class="category-selector">
		<div class="input-field">
			<div class="icon-holder position-relative">
				{#if currentSelectedCategory}
					{#if currentSelectedCategory.iconSet === 'bootstrapIcons'}
						<i
							data-icon-set={currentSelectedCategory.iconSet}
							class="bi bi-{currentSelectedCategory?.iconName} iconSet"
							title={currentSelectedCategory?.iconName}
						/>
					{/if}

					{#if currentSelectedCategory.iconSet === 'lucideIcons'}
						<i
							data-icon-set={currentSelectedCategory.iconSet}
							data-lucide={currentSelectedCategory?.iconName}
							class="iconSet ignoreIcon"
							title={currentSelectedCategory?.iconName}
						/>
					{/if}

					<button type="button" class="fab" on:click={clearSelection}>
						<i class="bi bi-x" />
					</button>
				{/if}
			</div>

			<input
				type="text"
				class="form-control"
				id="category"
				bind:value={inputSearch}
				on:input={filterSearch}
				on:focus={preInitSearch}
				on:blur={postSearch}
			/>

			<div class="add-category-button-wrapper">
				<button type="button" on:click={openCategoryPage} title="Add Category">
					<i class="bi bi-plus" />
				</button>
			</div>
		</div>

		{#if showOptions}
			<div class="selection-wrapper">
				{#each filteredCategories as category (category.iconName)}
					<div
						class="selection-option"
						on:click={onSelectCategory(category)}
						on:keydown={onSelectCategory(category)}
						role="button"
						tabindex="-1"
					>
						<div class="left">
							{#if category.iconSet === 'bootstrapIcons'}
								<i class="bi bi-{category?.iconName} iconSet" data-icon-set={category.iconSet} />
							{/if}

							{#if category.iconSet === 'lucideIcons'}
								<i
									data-lucide={category?.iconName}
									class="iconSet ignoreIconOption"
									data-icon-set={category.iconSet}
								/>
							{/if}
						</div>

						<div class="right">
							{category.name}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.category-selector {
		position: relative;
		width: 100%;

		.input-field {
			display: flex;

			.icon-holder {
				display: block;
				padding: 10px 5px;
				width: 20%;

				border-top: 1px solid $light-grey-color;
				border-left: 1px solid $light-grey-color;
				border-bottom: 1px solid $light-grey-color;
				border-top-left-radius: 5px;
				border-bottom-left-radius: 5px;

				.iconSet {
					font-size: 12px;
				}
			}

			input {
				border-radius: 0;
			}

			.add-category-button-wrapper {
				display: grid;
				button {
					display: block;
					border-top-right-radius: 5px;
					border-bottom-right-radius: 5px;

					border-top: 1px solid $light-grey-color;
					border-right: 1px solid $light-grey-color;
					border-bottom: 1px solid $light-grey-color;
				}
			}
		}

		.selection-wrapper {
			display: flex;
			flex-direction: column;
			width: inherit;

			max-height: 200px;
			overflow-y: auto;

			box-shadow: 0px 5px 5px $light-grey-color;
			position: absolute;

			background-color: $white-color;
			z-index: 2;

			.selection-option {
				display: flex;
				gap: 0.25rem;

				cursor: pointer;

				padding: 10px 5px;
				border: 1px solid $light-grey-color;

				&:hover {
					background-color: $green-color;
				}

				.left {
					i {
						font-size: 12px;
					}

					.iconSet {
						&:hover {
							color: $green-color;
						}
					}
				}

				&:last-child {
					border-bottom-left-radius: 4px;
					border-bottom-right-radius: 4px;
				}
			}
		}
	}
</style>
