<script lang="ts">
	import Table from '$lib/components/Table.svelte';
	import { StorageItems } from '$lib/data/core';
	import type { Account, ProfileData } from '$lib/data/data';
	import type { TableConfig, TableHeader } from '$lib/data/table';
	import {
		APIS,
		HTTP_METHOD,
		confirmAction,
		fetchData,
		getData,
		navigateTo,
		saveData
	} from '$lib/helpers/utils';
	import { onMount } from 'svelte';
	import Confirmation from '$lib/components/Confirmation.svelte';
	import type { ModalConfig } from '$lib/data/modal';
	import ProfileStore from '../../../../../stores/ProfileStore.js';
	import ToastStore from '../../../../../stores/ToastStore.js';

	export let data;

	let account: Account | null = null;
	let profileDetail: ProfileData | null = null;

	let accountDetails = {
		name: '',
		description: <string | null>'',
		createdDate: new Date()
	};

	let tableHeader: TableHeader[] = [
		{
			canSort: true,
			name: 'Name',
			width: 'auto'
		},
		{
			canSort: true,
			name: 'Description',
			width: 'auto'
		},
		{
			canSort: true,
			name: 'Created Date',
			width: 'auto'
		},
		{
			canSort: true,
			name: 'Actions',
			width: 'auto'
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
			title: 'Delete Record?'
		},
		body: {
			component: Confirmation,
			props: { message: 'You are about to delete this record, are you sure you want to do that?' }
		}
	};

	onMount(() => {
		account = getData(StorageItems.Accounts);

		if (account) {
			accountDetails.name = account.name;
			accountDetails.description = account.description;
			accountDetails.createdDate = new Date(account.createdDate);
		}

		ProfileStore.subscribe((profile) => {
			if (profile) {
				profileDetail = profile;

				tableConfig = {
					api: {
						path: APIS.RECORDS + '/' + profileDetail?.userId + '/' + data.accountId,
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

								navigateTo(`/members/${profileDetail?.userId}/accounts/${data.accountId}/records/${rowData.id}`);
							},
							editRow: (rowData: any) => {
								saveData(rowData, StorageItems.Records);

								navigateTo(
									`/members/${profileDetail?.userId}/accounts/${data.accountId}/records/${rowData.id}/edit`
								);
							},
							delete: {
								deleteRow: async (rowData: any) => {
									const id = rowData.id;
									const path = APIS.RECORDS + '/' + id;

									const confirmed = await confirmAction({ modalConfig });

									if (confirmed) {
										return new Promise((resolve) => {
											fetchData(HTTP_METHOD.DELETE, path, null)
												.then((resp) => {
													ToastStore.set({
														message: 'Successful in deleting record',
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
	<div class="account-container page-container">
		<div class="top">
			<div class="info">
				<h1>{accountDetails.name}</h1>
				<p>{accountDetails.description ?? ''}</p>
			</div>

			<div class="meta small-text">
				<span>Created since: {accountDetails.createdDate.toDateString()}</span>
			</div>
		</div>

		<div class="middle">
			<h3>All Records</h3>

			<div class="row">
				<div class="col-sm-3 col-md-0 col-lg-1">
					<button
						type="button"
						class="btn btn-primary"
						on:click={() =>
							navigateTo(
								`/members/${profileDetail?.userId}/accounts/${data.accountId}/records/0/new`
							)}>New</button
					>
				</div>
			</div>

			<div class="mt-4">
				<Table bind:tableHeaders={tableHeader} bind:tableConfig />
			</div>
		</div>
	</div>
</div>
