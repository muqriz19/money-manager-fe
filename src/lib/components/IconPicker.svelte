<script lang="ts">
	import type { IconSet, SelectedIcon } from '$lib/data/core';
	import { debounce } from '$lib/helpers/utils';
	import * as bootsrapIcons from 'bootstrap-icons/font/bootstrap-icons.json';
	import { createEventDispatcher } from 'svelte';

	const iconList: IconSet[] = [];

	let currentIconSet: IconSet | null = null;
	let currentIcons: string[] = [];
	let originalRefenceIcons: string[] = [];
	let searchQuery = '';
	export let selectedIcon: SelectedIcon | null = null;

	let hasListExpanded = false;
	let hasListHidden = false;

	export const dispatch = createEventDispatcher();

	function initIconset() {
		// default null
		const nullSet: IconSet = {
			name: 'Select an Iconset',
			set: '',
			icons: []
		};

		iconList.push(nullSet);

		// boostrap icons
		const boostrapStringJson = JSON.stringify(bootsrapIcons);
		const icons = [
			...new Set(
				boostrapStringJson.split('"').filter((iconInString) => {
					if (
						iconInString !== '{' &&
						iconInString !== '}' &&
						!iconInString.includes(':') &&
						!iconInString.includes('default')
					) {
						return true;
					}

					return false;
				})
			)
		];

		const iconSetBootstrap: IconSet = {
			name: 'Set 1',
			set: 'bootstrapIcons',
			icons: icons
		};

		iconList.push(iconSetBootstrap);
	}

	initIconset();

	function onSelectedIconSet($event: any) {
		const value = $event.target.value;
		searchQuery = '';

		if (value === '') {
			currentIconSet = null;
			currentIcons = [];
		} else {
			const currentSet = iconList.find((iconSet) => iconSet.set === value);

			if (currentSet) {
				currentIconSet = currentSet;

				currentIcons = currentIconSet.icons;
				originalRefenceIcons = currentIconSet.icons;
			}
		}
	}

	function searchIconSet($event: any) {
		debounce(500, () => {
			const query = String($event.target.value).toLowerCase();

			if (currentIconSet) {
				if (currentIconSet.set === 'bootstrapIcons') {
					const foundIcons = originalRefenceIcons.filter((ref) => {
						return ref.toLowerCase().includes(query);
					});

					currentIcons = foundIcons;
				}

				if (query === '') {
					currentIcons = currentIconSet.icons;
				}
			}
		});
	}

	function selectTheIcon(onSelectedIcon: string) {
		if (currentIconSet) {
			selectedIcon = {
				set: currentIconSet?.set,
				name: onSelectedIcon
			};

			dispatch('iconChanged', selectedIcon);
		}

		return null;
	}

	function clearSelectionIcon() {
		selectedIcon = null;

		dispatch('iconChanged', selectedIcon);
	}

	function toggleExpandIconList() {
		hasListExpanded = !hasListExpanded;
	}

	function toggleViewIconList() {
		hasListHidden = !hasListHidden;
	}
</script>

<div class="icon-picker-container">
	<div class="top">
		<div class="row">
			<div class="col-1 iconSelected">
				<div class="box position-relative">
					{#if selectedIcon}
						{#if selectedIcon?.set === 'bootstrapIcons'}
							<i class="bi bi-{selectedIcon?.name} iconSet" title={selectedIcon?.set} />
						{/if}
					{:else}
						<span>N/A</span>
					{/if}

					{#if selectedIcon}
						<button type="button" class="mini-fab" on:click={clearSelectionIcon}>
							<i class="bi bi-x" />
						</button>
					{/if}
				</div>
			</div>

			<div class="col-7">
				<input
					type="text"
					class="form-control"
					id="search"
					placeholder="Search"
					bind:value={searchQuery}
					on:input={searchIconSet}
				/>
			</div>

			<div class="col-4">
				<select
					class="form-select"
					aria-label="Default select example"
					on:change={onSelectedIconSet}
				>
					{#each iconList as set}
						<option value={set.set}>{set.name}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	{#if currentIconSet}
		<div class="sub-middle">
			<button type="button" class="btn btn-primary" on:click={toggleExpandIconList}>
				<i
					class="bi {hasListExpanded ? 'bi-chevron-contract' : 'bi-chevron-expand'}"
					title={hasListExpanded ? 'Contract' : 'Expand'}
				/>
			</button>

			<button type="button" class="btn btn-primary" on:click={toggleViewIconList}>
				<i
					class="bi bi-{hasListHidden ? 'eye' : 'eye-slash'}"
					title={hasListHidden ? 'Open' : 'Close'}
				/>
			</button>
		</div>
		{#if !hasListHidden}
			<div class="middle" style="max-height: {hasListExpanded ? '500px' : '250px'}">
				{#if currentIconSet.set === 'bootstrapIcons'}
					{#each currentIcons as icon}
						<button type="button" class="btn iconSet" on:click={selectTheIcon(icon)} title={icon}>
							<i class="bi bi-{icon}" data-icon-set={currentIconSet?.set} />
						</button>
					{/each}
				{/if}
			</div>
		{/if}
	{/if}
</div>

<style lang="scss">
	.icon-picker-container {
		.top {
			.iconSelected {
				.box {
					border: 1px solid $grey-color;
					width: 64px;
					height: 64px;

					border-radius: 5px;

					display: flex;
					justify-content: center;
					align-items: center;

					background-color: $white-color;
				}
			}
		}

		.sub-middle {
			margin-top: 10px;

			display: flex;
			justify-content: end;

			gap: 10px;
		}

		.middle {
			display: grid;
			margin-top: 1rem;

			grid-template-columns: repeat(auto-fit, minmax(64px, 64px));
			gap: 10px;

			max-height: 250px;
			overflow-y: auto;

			border-top: 1px solid $grey-color;
			border-bottom: 1px solid $grey-color;
			margin: 20px 0 0 0;
			padding: 20px 0;
		}
	}
</style>
