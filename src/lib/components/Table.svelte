<script lang="ts">
	import type { DataProp, TableAPIQuery, TableConfig, TableHeader } from '$lib/data/table';
	import { HTTP_METHOD, debounce, fetchData } from '$lib/helpers/utils';
	import Spinner from './Spinner.svelte';

	export let tableHeaders: TableHeader[] = [];
	export let tableConfig: TableConfig | null = {
		api: {
			path: '',
			queries: [],
			search: {
				query: null
			}
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
	let apiPath = '';
	let queries: TableAPIQuery[] = [];
	let searchQuery: TableAPIQuery | null = null;

	let respDataProp = '';
	let refTotal = '';
	let dataProperties: DataProp[] = [];
	let gotActions: boolean = false;
	let tableData: any[] = [];

	let totalDataNumber = 0;
	let pageCount = 0;

	let paginationArrays: number[] = [];
	let selectedPagination = 0;

	let currentSearchTerm: string | null = null;

	let deleteMethodRefresh = false;

	let isLoadingData = false;

	let ids: number[] = [];

	$: tableConfig && setup();

	const setup = () => {
		if (!tableConfig) {
			return;
		}

		// setup
		rootAPI = tableConfig.api.path;
		queries = tableConfig.api.queries;
		searchQuery = tableConfig.api.search.query;

		// data props
		const dataProps = tableConfig.dataHandle.dataProps;
		dataProperties = dataProps;

		// data sepecific
		respDataProp = tableConfig.dataHandle.property;
		refTotal = tableConfig.dataHandle.refTotal;

		// check if actions exists
		gotActions = dataProps.find((prop) => prop.name === 'actions') ? true : false;

		// pagination
		pageCount = tableConfig.dataHandle.pageCount;

		// delete method feature
		deleteMethodRefresh = tableConfig.actions.methods?.delete.refresh ? true : false;

		apiPath = constructAPI(rootAPI, queries, searchQuery);

		isLoadingData = true;

		fetchData(HTTP_METHOD.GET, apiPath, null).then((resp) => {
			if (!tableConfig) {
				return;
			}

			try {
				// errors first
				if (resp && !resp.hasOwnProperty(respDataProp)) {
					throw new Error('Please specify a data handle property');
				}

				if (dataProps && dataProps.length === 0) {
					throw new Error('Please specify at least one property to show on table');
				}

				if (
					(refTotal && refTotal.length === 0) ||
					!resp.hasOwnProperty(tableConfig.dataHandle.refTotal)
				) {
					console.warn('Enable to get total rows, pagination disabled');
				}

				tableData = constructData(resp, gotActions);

				if (totalDataNumber !== 0) {
					paginationArrays = generatePagination(totalDataNumber, pageCount);
					selectedPagination = 1;
				}

				isLoadingData = false;
			} catch (err) {
				isLoadingData = false;
				console.error(err);
			}
		});
	};

	const constructAPI = (
		path: string,
		queries: TableAPIQuery[],
		searchQuery: TableAPIQuery | null
	): string => {
		let finalAPI = path + '?';
		let query = '';

		// regular queries
		for (let q = 0; q < queries.length; q++) {
			if (q === 0) {
				query += `${queries[q].queryName}=${queries[q].queryValue}`;
			} else {
				query += `&${queries[q].queryName}=${queries[q].queryValue}`;
			}
		}

		// search queries
		if (searchQuery && currentSearchTerm !== null) {
			query += `&${searchQuery.queryName}=${currentSearchTerm}`;
		}

		return `${finalAPI}${query}`;
	};

	const constructData = (resp: any, gotActions: boolean) => {
		totalDataNumber = (resp as any)[refTotal];
		const tempData = (resp as any)[respDataProp] as any[];

		// if actions exists then add to table row
		if (gotActions) {
			tempData.forEach((data) => {
				data = Object.assign(data, {
					actions: {
						...tableConfig!.actions.has
					}
				});

				if (tableConfig!.actions.methods) {
					data.actions = Object.assign(data.actions, { ...tableConfig!.actions.methods });
				}
			});
		}

		// for reference
		tempData.forEach((data) => {
			data = Object.assign(data, {
				elementRef: {
					reference: null,
					id: generateRandomIds()
				}
			});
		});

		return tempData;
	};

	const generateRandomIds = () => {
		const randomNumber = Math.floor(Math.random() * 999999999) + 1;

		if (ids.indexOf(randomNumber) > 0) {
			generateRandomIds();
		} else {
			ids.push(randomNumber);
		}

		return randomNumber;
	};

	const generatePagination = (total: number, pageCount: number) => {
		const totalBoxes = Math.ceil(total / pageCount);

		return Array.from({ length: totalBoxes }, (_, i) => i + 1);
	};

	const paginate = (selectedPageNumber: number) => {
		if (!tableConfig) {
			return;
		}

		selectedPagination = selectedPageNumber;

		// set up query
		const queries = JSON.parse(JSON.stringify(tableConfig.api.queries));
		for (let q = 0; q < queries.length; q++) {
			if (queries[q].queryName === 'pageNumber') {
				queries[q].queryValue = String(selectedPagination);
			}
		}

		const newAPI = constructAPI(rootAPI, queries, searchQuery);

		isLoadingData = true;

		// go fetch
		fetchData(HTTP_METHOD.GET, newAPI, null)
			.then((resp) => {
				tableData = constructData(resp, gotActions);

				if (totalDataNumber !== 0) {
					paginationArrays = generatePagination(totalDataNumber, pageCount);
				}

				isLoadingData = false;
			})
			.catch((err) => {
				isLoadingData = false;
				console.error(err);
			});

		return null;
	};

	const onSearch = ($event: any) => {
		if (!tableConfig) {
			return;
		}

		debounce(1000, () => {
			isLoadingData = true;

			currentSearchTerm = $event.target.value !== '' ? $event.target.value : null;
			const newAPI = constructAPI(rootAPI, queries, searchQuery);

			// go fetch
			fetchData(HTTP_METHOD.GET, newAPI, null)
				.then((resp) => {
					tableData = constructData(resp, gotActions);

					if (totalDataNumber !== 0) {
						paginationArrays = generatePagination(totalDataNumber, pageCount);
						selectedPagination = 1;
					}

					isLoadingData = false;
				})
				.catch((err) => {
					isLoadingData = false;
					console.error(err);
				});
		});
	};

	const refresh = () => {
		paginate(selectedPagination);
	};

	const executeCode = async (data: any, functionCode: Function) => {
		return await functionCode(data);
	};

	const deleteMethod = (data: any, functionCode: Function, refreshTable: boolean) => {
		if (functionCode) {
			executeCode(data, functionCode).then((apiSuccess) => {
				if (refreshTable && apiSuccess) {
					refresh();
				}
			});
		}

		return null;
	};

	const returnCorrectObject = (propName: string, data: any) => {
		const isManyProps = propName.split('+').length > 1;
		let finalObjectData = {};

		if (isManyProps) {
			const props = propName.split('+');

			for (let i = 0; i < props.length; i++) {
				finalObjectData = Object.assign(finalObjectData, { [props[i]]: data[props[i]] });
			}
		} else {
			finalObjectData = Object.assign(finalObjectData, { [propName]: data[propName] });
		}

		return finalObjectData;
	};

	const renderRow = (rowValue: any, rowId: any) => {
		if (rowValue instanceof Element) {
			setTimeout(() => {
				const element = document.querySelector(`[data-row-id="${rowId}"]`)!;
				element.innerHTML = '';
				element.append(rowValue);
			}, 100);

			return '';
		} else {
			return rowValue;
		}
	};

	const returnIdsIfElement = (element: any, id: number) => {
		if (element instanceof Element) {
			return id;
		} else {
			return null;
		}
	};

	const cleanTableData = (data: any) => {
		delete data.actions;
		delete data.elementRef;

		return data;
	};
</script>

<div class="table-container">
	<div class="table-actions">
		<div class="row">
			<div class="col-sm-4 col-md-4 col-lg-4 ms-auto d-flex gap-2">
				<button type="button" class="btn btn-primary" on:click={refresh}>
					<i class="bi bi-arrow-clockwise" />
				</button>
				<input type="text" class="ms-auto form-control" placeholder="Search" on:input={onSearch} />
			</div>
		</div>
	</div>

	<div class="table-wrapper">
		<table class="table table-hover tableStyle">
			<thead>
				<tr>
					{#each tableHeaders as tableHead}
						<th scope="col" style="width: {tableHead.width}">
							<span>{tableHead.name}</span>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#if isLoadingData === false}
					{#if tableData?.length > 0}
						{#each tableData as data}
							<tr>
								{#each dataProperties as prop}
									{#if prop.name !== 'actions'}
										{#if prop?.command}
											<td
												data-row-id={returnIdsIfElement(
													prop?.command(returnCorrectObject(prop.name, data)),
													data.elementRef.id
												)}
											>
												{renderRow(
													prop?.command(returnCorrectObject(prop.name, data)),
													data.elementRef.id
												)}
											</td>
										{:else}
											<td>{data[prop.name]}</td>
										{/if}
									{:else}
										<td>
											<div>
												{#if data[prop.name]?.view}
													{#if data[prop.name].viewRow}
														<button
															type="button"
															class="mm-btn"
															on:click={data[prop.name].viewRow(cleanTableData(data))}
														>
															<i class="bi bi-eye" />
														</button>
													{:else}
														<button type="button" class="mm-btn">
															<i class="bi bi-eye" />
														</button>
													{/if}
												{/if}

												{#if data[prop.name]?.edit}
													{#if data[prop.name].editRow}
														<button
															type="button"
															class="mm-btn"
															on:click={data[prop.name].editRow(data)}
														>
															<i class="bi bi-pencil-square" />
														</button>
													{:else}
														<button type="button" class="mm-btn">
															<i class="bi bi-pencil-square" />
														</button>
													{/if}
												{/if}

												{#if data[prop.name]?.delete}
													{#if data[prop.name].delete.deleteRow}
														<button
															type="button"
															class="mm-btn"
															on:click={deleteMethod(
																data,
																data[prop.name].delete.deleteRow,
																deleteMethodRefresh
															)}
														>
															<i class="bi bi-trash" />
														</button>
													{:else}
														<button type="button" class="mm-btn">
															<i class="bi bi-trash" />
														</button>
													{/if}
												{/if}
											</div>
										</td>
									{/if}
								{/each}
							</tr>
						{/each}
					{:else}
						<span>No data found...</span>
					{/if}
				{:else}
					<tr class="loader-container">
						<Spinner />
					</tr>
				{/if}
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
		border: 1px solid $grey-color;
		padding: 1rem;

		.table-actions {
			padding-bottom: 1rem;
		}

		.table-wrapper {
			table.tableStyle {
				thead {
					th {
						background-color: $green-color-alt;
						color: $white-color;
					}
				}
			}
		}

		.pagination {
			display: flex;
			gap: 0.5rem;

			.pagination-button {
				background: $white-color;
				border: 1px solid $green-color-alt;
				border-radius: 5px;

				height: 32px;
				width: 32px;
				text-align: center;
				padding: 2px;
				cursor: pointer;

				&:hover {
					background-color: $green-color-alt;
					color: $white-color;
					transition: 100ms ease-in;
				}
			}

			.pagination-button.active {
				background-color: $green-color-alt;
				color: $white-color;
			}
		}
	}
</style>
