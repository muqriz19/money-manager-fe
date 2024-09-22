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

	function createLucideIconHtml() {
		return new Promise<void>((resolve) => {
			setTimeout(() => {
				if (doesLucideITagExist()) {
					resolve();
				} else {
					const i = document.createElement('i');

					const iconName = iconSet?.name ?? '';
					const set = iconSet?.set ?? '';

					i.setAttribute('class', 'iconSet ' + extraClass);
					i.setAttribute('data-lucide', iconName);
					i.setAttribute('data-icon-set', set);
					i.style.border = 'unset';

					const wrapper = document.querySelector('#iconWrapper' + id);
					wrapper?.append(i);

					resolve();
				}
			}, 10);
		});
	}

	function doesLucideITagExist() {
		const wrapper = document.querySelector('#iconWrapper' + id);
		const iTag = wrapper?.children[0];

		let doesExist = false;

		if (iTag) {
			doesExist = iTag.hasAttribute('data-lucide');
		}

		return doesExist;
	}

	$: {
		if (iconSet) {
			if (iconSet.set == 'lucideIcons') {
				createLucideIconHtml().then(() => {
					createLucideIcons(0);
				});
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
			<i
				data-lucide={iconSet?.name}
				class="iconSet {extraClass}"
				data-icon-set={iconSet.set}
				style="border: unset"
			/>
		{/if}
	{/if}
</div>

<style lang="scss">
	.icon-wrapper {
		padding: 5px;
		border-radius: 5px;
		background-color: $white-color;
		width: 50px;
	}
</style>
