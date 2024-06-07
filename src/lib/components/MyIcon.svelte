<script lang="ts">
	import type { SelectedIcon } from '$lib/data/core';
	import { clearAnyLucideIcons, createLucideIcons } from '$lib/helpers/ui';
	import { generateRandomId } from '$lib/helpers/utils';
	import { onDestroy, onMount } from 'svelte';

	export let iconSet: SelectedIcon | null = null;
	export let extraClass: string = '';

	let id: string = '';

	onMount(() => {
		id = generateRandomId(20000);
	});

	onDestroy(() => {
		resetIcon();
	});

	function resetIcon() {
		return new Promise<void>((resolve) => {
			iconSet = null;
			extraClass = '';

			resolve();
		});
	}

	$: {
		if (iconSet) {
			if (iconSet.set == 'lucideIcons') {
				createLucideIcons(100);
			} else {
				clearAnyLucideIcons(
					{ ignoreClass: [] },
					document.querySelector(`#iconWrapper${id}`) as HTMLElement
				);
			}
		}
	}
</script>

<div class="icon-wrapper" id="iconWrapper{id}">
	{#if iconSet}
		{#if iconSet.set === 'bootstrapIcons'}
			<i class="bi bi-{iconSet.name} {extraClass}" data-icon-set={iconSet?.set} />
		{:else}
			<i data-lucide={iconSet?.name} class="iconSet {extraClass}" data-icon-set={iconSet.set} />
		{/if}
	{/if}
</div>

<style lang="scss">
	.icon-wrapper {
		padding: 5px;
		border-radius: 5px;
		background-color: $white-color;
		width: 50px;

		.iconSet {
			border: unset;
		}
	}
</style>
