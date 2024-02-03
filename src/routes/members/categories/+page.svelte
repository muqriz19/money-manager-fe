<script lang="ts">
	import Confirmation from '$lib/components/Confirmation.svelte';
	import Table from '$lib/components/Table.svelte';
	import { StorageItems } from '$lib/data/core';
	import type { ProfileData } from '$lib/data/data';
	import type { ModalConfig } from '$lib/data/modal';
	import type { TableConfig, TableHeader } from '$lib/data/table';
	import {
		APIS,
		HTTP_METHOD,
		confirmAction,
		fetchData,
		navigateTo,
		saveData
	} from '$lib/helpers/utils';
	import { onMount } from 'svelte';
	import ToastStore from '../../../stores/ToastStore';
	import ProfileStore from '../../../stores/ProfileStore';

	let profileDetail: ProfileData | null = null;

	let allTableHeaders: TableHeader[] = [
		{
			name: 'Name',
			canSort: true,
			width: 'auto'
		},
		{
			name: 'Description',
			canSort: true,
			width: 'auto'
		},
		{
			name: 'Icon',
			canSort: false,
			width: '10%'
		},
		{
			name: 'Actions',
			canSort: true,
			width: '15%'
		}
	];

	let tableConfig: TableConfig | null = null;

	let modalConfig: ModalConfig = {
		foot: {
			cancel: {},
			execute: {
				hideModal: true
			}
		},
		head: {
			title: 'Delete Category?'
		},
		body: {
			component: Confirmation,
			props: { message: 'You are about to delete this category, are you sure you want to do that?' }
		}
	};

	onMount(() => {
		ProfileStore.subscribe((profile) => {
			if (profile) {
				profileDetail = profile;

				tableConfig = {
					api: {
						path: `${APIS.CATEGORIES}/${profileDetail?.userId}`,
						queries: [
							{
								queryName: 'pageNumber',
								queryValue: '1'
							},
							{
								queryName: 'pageSize',
								queryValue: '10'
							}
						],
						search: {
							query: {
								queryName: 'search',
								queryValue: ''
							}
						}
					},
					dataHandle: {
						property: 'data',
						pageCount: 10,
						refTotal: 'total',
						dataProps: [
							{
								name: 'name'
							},
							{
								name: 'description',
								command: (row) => {
									return row.description ? row.description : '';
								}
							},
							{
								name: 'iconSet+iconName',
								command(row) {
									if (row?.iconSet === 'bootstrapIcons') {
										const iTag = document.createElement('i');

										iTag.setAttribute('class', `bi bi-${row?.iconName} iconSet`);
										iTag.setAttribute('title', row?.iconName);
										iTag.setAttribute('data-icon-set', row.iconSet);
										iTag.style.fontSize = '16px';

										return iTag;
									} else {
										return '';
									}
								}
							},
							{
								name: 'actions'
							}
						]
					},
					actions: {
						has: { edit: true, delete: true, view: false },

						methods: {
							editRow: (rowData: any) => {
								saveData(rowData, StorageItems.Categories);

								navigateTo('/members/categories/edit');
							},
							delete: {
								deleteRow: async (rowData: any) => {
									const id = rowData.id;
									const path = APIS.CATEGORIES + '/' + id;

									const confirmed = await confirmAction({ modalConfig });

									if (confirmed) {
										return new Promise((resolve) => {
											fetchData(HTTP_METHOD.DELETE, path, null)
												.then((resp) => {
													ToastStore.set({
														message: 'Successful in deleting category',
														title: 'Success',
														type: 'success'
													});

													resolve(true);
												})
												.catch((err) => {
													ToastStore.set({
														message: err,
														title: 'Error occured',
														type: 'error'
													});

													resolve(false);
												});
										});
									}
								},
								refresh: true
							}
						}
					}
				};
			}
		});
	});
</script>

<div class="page">
	<div class="page-top">
		<h1>Categories</h1>
	</div>

	<div class="page-middle">
		<div class="row">
			<div class="col-sm-3 col-md-0 col-lg-1">
				<button
					type="button"
					class="btn btn-primary"
					on:click={() => navigateTo('/members/categories/new')}>New</button
				>
			</div>
		</div>

		<div class="mt-4">
			<Table bind:tableHeaders={allTableHeaders} bind:tableConfig />
		</div>
	</div>
</div>
