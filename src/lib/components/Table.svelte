<script lang="ts">
	import type { TableAPIQuery, TableConfig, TableHeaders } from '$lib/data/table';
	import { APIS, HTTP_METHOD, fetchData } from '$lib/helpers/utils';
	import { onMount } from 'svelte';

	export let tableHeaders: TableHeaders[] = [];
	export let tableConfig: TableConfig = {
		api: {
			path: '',
			queries: []
		},
		dataHandle: {
			property: '',
			dataProps: [],
			pageCount: 10,
			refTotal: ''
		},
		actions: {
			has: {
				edit: false,
				delete: false,
				view: false
			}
		}
	};

	let rootAPI = '';

	let dataProperties: string[] = [];
	let gotActions: boolean = false;
	let tableData: any[] = [];

	let totalDataNumber = 0;
	let pageCount = 0;

	let paginationArrays: number[] = [];
	let selectedPagination = 0;

	onMount(() => {
		console.log(tableConfig);

		setup();
	});

	const setup = () => {
		rootAPI = tableConfig.api.path;
		const apiPath = constructAPI(rootAPI, tableConfig.api.queries);

		fetchData(HTTP_METHOD.GET, apiPath, null).then((resp) => {
			console.log(resp);

			try {
				// errors first
				if (resp && !resp.hasOwnProperty(tableConfig.dataHandle.property)) {
					throw new Error('Please specify a data handle property');
				}

				if (tableConfig.dataHandle.dataProps && tableConfig.dataHandle.dataProps.length === 0) {
					throw new Error('Please specify properties to match to show');
				}

				if (
					(tableConfig.dataHandle.refTotal && tableConfig.dataHandle.refTotal.length === 0) ||
					!resp.hasOwnProperty(tableConfig.dataHandle.refTotal)
				) {
					console.warn('Enable to get total rows, pagination disabled');
				}

				// setup
				const dataProps = tableConfig.dataHandle.dataProps;
				dataProperties = dataProps;

				// pagination
				pageCount = tableConfig.dataHandle.pageCount;
				totalDataNumber = (resp as any)[tableConfig.dataHandle.refTotal];

				// check if actions exists
				gotActions = dataProps.indexOf('actions') > 0 ? true : false;

				const responseData = (resp as any)[tableConfig.dataHandle.property] as any[];

				// add final data
				tableData = constructData(responseData, gotActions);

				if (totalDataNumber !== 0) {
					paginationArrays = generatePagination(totalDataNumber, pageCount);
					selectedPagination = 1;
				}
			} catch (err) {
				console.error(err);
			}
		});
	};

	const constructAPI = (path: string, queries: TableAPIQuery[]): string => {
		let finalAPI = path + '?';
		let query = '';

		for (let q = 0; q < queries.length; q++) {
			if (q === 0) {
				query += `${queries[q].queryName}=${queries[q].queryValue}`;
			} else {
				query += `&${queries[q].queryName}=${queries[q].queryValue}`;
			}
		}

		return `${finalAPI}${query}`;
	};

	const constructData = (data: any[], gotActions: boolean) => {
		const tempData = data;

		// if exists then add to table
		if (gotActions) {
			tempData.forEach((data) => {
				data = Object.assign(data, {
					actions: {
						...tableConfig.actions.has
					}
				});
			});
		}

		return data;
	};

	const generatePagination = (total: number, pageCount: number) => {
		console.log(total, pageCount);

		const totalBoxes = Math.ceil(total / pageCount);

		return Array.from({ length: totalBoxes }, (_, i) => i + 1);
	};

	const paginate = (paginationNumber: number) => {
		selectedPagination = paginationNumber;

		// set up query
		const queries = JSON.parse(JSON.stringify(tableConfig.api.queries));
		for (let q = 0; q < queries.length; q++) {
			if (queries[q].queryName === 'pageNumber') {
				queries[q].queryValue = String(selectedPagination);
			}
		}

		const newAPI = constructAPI(rootAPI, queries);

		// go fetch
		fetchData(HTTP_METHOD.GET, newAPI, null).then((resp) => {
			const responseData = (resp as any)[tableConfig.dataHandle.property] as any[];

			tableData = constructData(responseData, gotActions);
		});

		return null;
	};
</script>

<div class="table-container">
	<div class="table-actions">
		<div class="row">
			<div class="col-sm-3 col-md-3 col-lg-3 ms-auto">
				<input type="text" class="ms-auto form-control" placeholder="Search" />
			</div>
		</div>
	</div>

	<div class="table-wrapper">
		<table class="table table-hover tableStyle ">
			<thead>
				<tr>
					{#each tableHeaders as tableHead}
						<th scope="col">
							<span>{tableHead.name}</span>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each tableData as data}
					<tr>
						{#each dataProperties as prop}
							{#if prop !== 'actions'}
								<td>{data[prop]}</td>
							{:else}
								<td>
									<div>
										{#if data[prop]?.delete}
											<i class="bi bi-trash" />
										{/if}

										{#if data[prop]?.edit}
											<i class="bi bi-pencil-square" />
										{/if}

										{#if data[prop]?.view}
											<i class="bi bi-eye" />
										{/if}
									</div>
								</td>
							{/if}
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>

		<div class="pagination">
			{#each paginationArrays as box}
				<button
					type="button"
					class={selectedPagination === box ? 'active pagination-button' : 'pagination-button'}
					on:click={paginate(box)}
					disabled={box === selectedPagination}
				>
					{box}
				</button>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	.table-container {
		border: 1px solid rgba(0, 0, 0, 0.096);
		padding: 1rem;

		.table-wrapper {
			table.tableStyle {
				tbody {
					max-height: 500px !important;
					min-height: 500px !important;

					tr {
						height: 32px;

						&:hover {
							background-color: green !important;
							cursor: pointer;
						}
					}
				}
			}
		}

		.pagination {
			display: flex;
			gap: 0.5rem;
			.pagination-button {
				border: 1px solid rgb(228, 221, 221);
				height: 32px;
				width: 32px;
				text-align: center;
				padding: 2px;
				cursor: pointer;

				&:hover {
					background-color: green;
					color: white;
				}
			}

			.pagination-button.active {
				background-color: green;
				color: white;
			}
		}
	}
</style>
