<script lang="ts">
	import type { SelectedIcon } from '$lib/data/core';

	export let iconSet: SelectedIcon | null = null;
</script>

<div class="icon-wrapper">
	{#if iconSet}
		{#if iconSet.set === 'bootstrapIcons'}
			<i class="bi bi-{iconSet.name}" data-icon-set={iconSet?.set} />
		{/if}

		{#if iconSet.set === 'lucideIcons'}
			<i data-lucide={iconSet?.name} class="iconSet" data-icon-set={iconSet.set} />
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
