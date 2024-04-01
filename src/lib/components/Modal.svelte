<script lang="ts">
	import type { ModalConfig } from '$lib/data/modal';
	import { generateRandomId } from '$lib/helpers/utils';
	import { createEventDispatcher, onMount } from 'svelte';

	let modalElement: HTMLElement | null;
	let buttonModal: HTMLButtonElement | null;

	let finalModalId: string = '';

	export const dispatch = createEventDispatcher();

	export let modalConfig: ModalConfig = {
		foot: {
			cancel: undefined,
			execute: undefined
		},
		head: {
			title: ''
		},
		body: {
			component: undefined
		}
	};

	export let result: any = true;
	export let disabledButton = false;

	onMount(() => {
		hideModal();

		showModal();
	});

	export const showModal = () => {
		generateModalId().then((modalId: string) => {
			modalElement = document.getElementById(`modalTHING_${modalId}`);
			buttonModal = document.querySelector(`#btnModal_${modalId}`) as HTMLButtonElement;

			if (buttonModal) {
				buttonModal.click();
			}
		});
	};

	export const hideModal = () => {
		if (modalElement) {
			modalElement.dispatchEvent(
				new KeyboardEvent('keydown', {
					keyCode: 27,
					which: 27,
					key: 'Escape',
					code: 'Escape'
				})
			);
		}
	};

	const executeCommand = () => {
		const command = modalConfig?.foot.execute?.command;
		const hideTheModal = modalConfig?.foot?.execute?.hideModal;

		if (command && typeof command === 'function') {
			command(result).then((success) => {
				if (success) {
					dispatch('result', result);

					if (hideTheModal) {
						// hide
						hideModal();
					}
				}
			});
		} else {
			hideModal();
			dispatch('result', result);
		}
	};

	function generateModalId() {
		return new Promise<string>(async (resolve) => {
			let modalId = generateRandomId(5);

			finalModalId = modalId;

			resolve(modalId);
		});
	}

	const closeModal = () => {
		dispatch('result', false);
	};
</script>

<button
	type="button"
	id="btnModal_{finalModalId}"
	class="btn btn-primary invisible"
	data-bs-toggle="modal"
	data-bs-target="#modalTHING_{finalModalId}"
>
	Launch demo modal
</button>

<div class="modal fade" tabindex="-1" id="modalTHING_{finalModalId}">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">{modalConfig?.head?.title}</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
			</div>
			{#if modalConfig?.body?.component}
				<div class="modal-body">
					<svelte:component this={modalConfig?.body?.component} {...modalConfig?.body.props} />
				</div>
			{/if}

			<div class="modal-footer">
				{#if modalConfig?.foot?.cancel}
					<button
						type="button"
						class="btn btn-secondary"
						data-bs-dismiss="modal"
						on:click={closeModal}>Close</button
					>
				{/if}

				{#if modalConfig?.foot?.execute}
					<button
						type="button"
						class="btn btn-primary"
						on:click={executeCommand}
						disabled={disabledButton}>{modalConfig?.foot?.execute?.text ?? 'Save Changes'}</button
					>
				{/if}
			</div>
		</div>
	</div>
</div>
