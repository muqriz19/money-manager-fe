<script lang="ts">
	import 'bootstrap/dist/css/bootstrap.min.css';
	import 'bootstrap-icons/font/bootstrap-icons.min.css';

	import '$lib/styles/global.scss';

	import Navbar from '$lib/components/Navbar.svelte';
	import { onDestroy, onMount } from 'svelte';

	import { toasts, ToastContainer, FlatToast } from 'svelte-toasts';
	import ToastStore from '../stores/ToastStore';
	import type { ToastType } from 'svelte-toasts/types/common';
	import type { Unsubscriber } from 'svelte/store';
	import Footer from '$lib/components/Footer.svelte';

	let unsubscriber: Unsubscriber;

	onMount(() => {
		unsubscriber = ToastStore.subscribe((value) => {
			if (value) {
				showToast(value.title, value.message, value.type);
			}
		});
	});

	onDestroy(() => {
		if (unsubscriber) {
			unsubscriber();
		}
	});

	const showToast = (title: string, message: string, type: ToastType) => {
		toasts.add({
			title,
			description: message,
			duration: 5000, // 0 or negative to avoid auto-remove
			placement: 'top-right',
			type: type,
			theme: 'dark',
			onClick: () => {},
			onRemove: () => {}
		});
	};
</script>

<Navbar />

<div class="container">
	<div class="page-container">
		<slot />
	</div>
</div>

<Footer />

<ToastContainer let:data>
	<FlatToast {data} />
</ToastContainer>

<style lang="scss">
	.container {
		.page-container {
			margin-bottom: 5rem;
		}
	}
</style>
