<script lang="ts">
	import Confirmation from '$lib/components/Confirmation.svelte';
	import Table from '$lib/components/Table.svelte';
	import { StorageItems } from '$lib/data/core';
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
	import type { ProfileData } from '$lib/data/data';
	import ProfileStore from '../../../../stores/ProfileStore';
	import ToastStore from '../../../../stores/ToastStore';

	let profileDetail: ProfileData | null = null;

	let accountTableHeaders: TableHeader[] = [
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
			name: 'Created Date',
			canSort: true,
			width: 'auto'
		},
		{
			name: 'Action',
			canSort: true,
			width: '12%'
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
			title: 'Delete Account?'
		},
		body: {
			component: Confirmation,
			props: { message: 'You are about to delete this account, are you sure you want to do that?' }
		}
	};

	onMount(() => {
		ProfileStore.subscribe((profile) => {
			if (profile) {
				profileDetail = profile;

				tableConfig = {
					api: {
						path: APIS.ACCOUNTS + '/' + profileDetail?.userId,
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
						pageCount: 10,
						property: 'data',
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
								name: 'createdDate',
								command: (row) => {
									const date = new Date(row.createdDate).toDateString();

									return date;
								}
							},
							{
								name: 'actions'
							}
						],

						refTotal: 'total'
					},
					actions: {
						has: {
							edit: true,
							delete: true,
							view: true
						},
						methods: {
							viewRow: (rowData: any) => {
								const id = rowData.id;
								saveData(rowData, StorageItems.Accounts);

								navigateTo(`/members/${profileDetail?.userId}/accounts/${id}`);
							},
							editRow: (rowData: any) => {
								saveData(rowData, StorageItems.Accounts);

								navigateTo(`/members/${profileDetail?.userId}/accounts/${rowData.id}/edit`);
							},
							delete: {
								deleteRow: async (rowData: any) => {
									const id = rowData.id;
									const path = APIS.ACCOUNTS + '/' + id;

									const confirmed = await confirmAction({ modalConfig });

									if (confirmed) {
										return new Promise((resolve) => {
											fetchData(HTTP_METHOD.DELETE, path, null)
												.then((resp) => {
													ToastStore.set({
														message: 'Successful in deleting account',
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
		<h1>Accounts</h1>
	</div>

	<div class="page-middle">
		<div class="row">
			<div class="col-sm-3 col-md-0 col-lg-1">
				<button
					type="button"
					class="btn btn-primary"
					on:click={() => navigateTo(`/members/${profileDetail?.userId}/accounts/0/new`)}
					>New</button
				>
			</div>
		</div>

		<div class="mt-4">
			<Table bind:tableHeaders={accountTableHeaders} bind:tableConfig />
		</div>
	</div>
</div>
