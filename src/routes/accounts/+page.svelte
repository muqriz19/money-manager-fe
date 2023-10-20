<script lang="ts">
	import Table from '$lib/components/Table.svelte';
	import type { TableConfig, TableHeaders } from '$lib/data/table';
	import { APIS, navigateTo } from '$lib/helpers/utils';

	let accountTableHeaders: TableHeaders[] = [
		{
			name: 'Name',
			canSort: true,
			icon: null,
			width: '12px'
		},
		{
			name: 'Description',
			canSort: true,
			icon: null,
			width: '12px'
		},
		{
			name: 'Created Date',
			canSort: true,
			icon: null,
			width: '12px'
		},
		{
			name: 'Action',
			canSort: true,
			icon: null,
			width: '12px'
		}
	];

	let tableConfig: TableConfig = {
		api: {
			path: APIS.ACCOUNTS,
			queries: [
				{
					queryName: 'pageNumber',
					queryValue: '1'
				},
				{
					queryName: 'pageSize',
					queryValue: '10'
				}
			]
		},
		dataHandle: {
			pageCount: 10,
			property: 'data',
			dataProps: ['name', 'description', 'createdDate', 'actions'],
			refTotal: 'total'
		},
		actions: {
			has: {
				edit: false,
				delete: true,
				view: false
			}
		}
	};
</script>

<div class="page">
	<div class="page-top">
		<h1>Accounts</h1>
	</div>

	<div class="page-middle">
		<div class="page-buttons">
			<button type="button" class="btn btn-primary" on:click={() => navigateTo('/accounts/editor')}
				>New</button
			>
		</div>

		<div class="mt-4">
			<Table bind:tableHeaders={accountTableHeaders} bind:tableConfig />
		</div>
	</div>
</div>
