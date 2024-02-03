<script lang="ts">
	import type { LoaderType } from '$lib/data/data';

	export let loaderType: LoaderType = 'regular';
    export let color = "#23c723";
</script>

{#if loaderType === 'regular'}
	<span class="loader regular" style="border-color: {color}" />
{/if}

<style lang="scss">
	.loader.regular {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		display: inline-block;
		border-top: 3px solid black;
		border-right: 3px solid transparent;
		box-sizing: border-box;
		animation: rotation 1s linear infinite;

		background-color: unset;

		@keyframes rotation {
			0% {
				transform: rotate(0deg);
			}
			100% {
				transform: rotate(360deg);
			}
		}
	}
</style>
