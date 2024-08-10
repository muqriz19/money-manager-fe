<script lang="ts">
	import type {
		Log,
		LogDto,
		ProfileData,
		Record,
		Transaction,
		TransactionDto
	} from '$lib/data/data';
	import { APIS, HTTP_METHOD, fetchData, triggerModal } from '$lib/helpers/utils';
	import { onMount } from 'svelte';
	import ProfileStore from '../../../../../../../stores/ProfileStore';
	import type { ModalConfig } from '$lib/data/modal';
	import LogForm from '$lib/components/logs/LogForm.svelte';
	import ToastStore from '../../../../../../../stores/ToastStore';
	import Confirmation from '$lib/components/Confirmation.svelte';
	import TransactionForm from '$lib/components/TransactionForm.svelte';
	import SpaceField from '$lib/components/logs/SpaceField.svelte';
	import { SpaceItem, type SpaceAction, type SpaceActions } from '$lib/data/space';
	import Overview from '$lib/components/Overview.svelte';

	export let data: any;

	let ids = {
		userId: 0,
		accountId: 0,
		id: 0
	};

	let recordData: Record = {
		accountId: 0,
		createdDate: new Date(),
		description: null,
		id: 0,
		logs: [],
		name: '',
		userId: 0
	};

	let profileDetail: ProfileData | null = null;

	let modalConfig: ModalConfig | null;

	let totalValue = 0;

	let searchLogQuery = '';
	let finalLogs: LogDto[] = [];

	onMount(() => {
		ids.userId = Number(data.userId);
		ids.accountId = Number(data.accountId);
		ids.id = Number(data.recordId);

		const urlFetchData = `Records/${ids.userId}/${ids.accountId}/${ids.id}`;

		fetchRecordData(urlFetchData);

		ProfileStore.subscribe((profile) => {
			if (profile) {
				profileDetail = profile;
			}
		});
	});

	function setLogs(logsDto: LogDto[]) {
		return new Promise((resolve) => {
			recordData.logs = logsDto;
			finalLogs = logsDto;

			resolve(true);
		});
	}

	function fetchRecordData(url: string) {
		fetchData(HTTP_METHOD.GET, url, null).then((respData) => {
			if (respData) {
				recordData = {
					id: respData.data.id,
					accountId: respData.data.accountId,
					createdDate: new Date(respData.data.createdDate),
					description: respData.data.description,
					logs: respData.data.logs,
					userId: respData.data.userId,
					name: respData.data.name
				};

				setLogs(recordData.logs);
			}
		});
	}

	function newLog() {
		modalConfig = {
			foot: {
				cancel: {},
				execute: {
					hideModal: true,
					text: 'Save',
					command: saveLog
				}
			},
			head: {
				title: 'New Log'
			},
			body: {
				component: LogForm,
				props: {
					logData: {
						categoryId: 0,
						createdDate: new Date(),
						description: null,
						id: 0,
						name: '',
						recordId: ids.id,
						userId: ids.userId,
						value: 0
					}
				}
			}
		};

		openLogFormModal();
	}

	async function openLogFormModal() {
		triggerModal({ modalConfig });
	}

	function saveLog(log: Log): Promise<boolean> {
		const url = APIS.LOGS + `/`;

		return new Promise((resolve) => {
			fetchData(HTTP_METHOD.POST, url, log)
				.then((resp) => {
					ToastStore.set({
						message: resp.message,
						title: 'Created Log',
						type: 'success'
					});

					if (resp) {
						const currentLogs = recordData?.logs ? [...recordData?.logs] : [];
						const allLogs: LogDto[] = [...currentLogs, resp.data];

						setLogs(allLogs).then(() => {
							searchLog();
						});

						resolve(true);
					}
				})
				.catch((err) => {
					ToastStore.set({
						title: 'Error occured',
						message: err.message,
						type: 'error'
					});

					resolve(false);
				});
		});
	}

	async function onDeleteLog(logId: number) {
		modalConfig = {
			foot: {
				cancel: {},
				execute: {
					hideModal: true
				}
			},
			head: {
				title: 'Delete Log?'
			},
			body: {
				component: Confirmation,
				props: { message: 'You are about to delete this log, are you sure you want to do that?' }
			}
		};

		const confirmed = await triggerModal({ modalConfig });
		if (confirmed) {
			const path = `${APIS.LOGS}/${logId}`;

			return new Promise((resolve) => {
				fetchData(HTTP_METHOD.DELETE, path, null)
					.then((resp) => {
						ToastStore.set({
							message: 'Successful in deleting log',
							title: 'Success',
							type: 'success'
						});

						let indexLog = recordData.logs.findIndex((theLog) => theLog.id === logId);
						recordData.logs.splice(indexLog, 1);

						setLogs(recordData.logs).then(() => {
							searchLog();
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
	}

	function updateLog(log: Log): Promise<boolean> {
		const url = APIS.LOGS + `/`;

		return new Promise((resolve) => {
			fetchData(HTTP_METHOD.PUT, url, log)
				.then((resp) => {
					ToastStore.set({
						message: resp.message,
						title: 'Updated Log',
						type: 'success'
					});

					if (resp) {
						const currentLogs = recordData?.logs ? [...recordData?.logs] : [];

						// replace
						const index = currentLogs.findIndex((log) => log.id === resp.data.id);

						if (index !== -1) {
							currentLogs[index] = resp.data;
						}

						const allLogs: LogDto[] = [...currentLogs];

						setLogs(allLogs).then(() => {
							searchLog();
						});

						resolve(true);
					}
				})
				.catch((err) => {
					ToastStore.set({
						title: 'Error occured',
						message: err.message,
						type: 'error'
					});

					resolve(false);
				});
		});
	}

	function onTransactionForm(operation: SpaceActions, log: LogDto, transaction: TransactionDto) {
		modalConfig = {
			foot: {
				cancel: {},
				execute: {
					hideModal: true,
					text: 'Save',
					command: undefined
				}
			},
			head: {
				title: operation === 'add' ? 'Add Transaction' : 'Edit Transaction'
			},
			body: {
				component: TransactionForm,
				props: {
					logData: {
						...log
					},
					transactionData: operation === 'add' ? null : { ...transaction }
				}
			}
		};

		if (operation === 'add') {
			modalConfig.foot.execute!.command = createTransaction;
		}

		if (operation === 'edit') {
			modalConfig.foot.execute!.command = updateTransaction;
		}

		openLogFormModal();
	}

	function createTransaction(transaction: Transaction): Promise<boolean> {
		const url = `${APIS.TRANSACTIONS}/`;

		return new Promise((resolve) => {
			fetchData(HTTP_METHOD.POST, url, transaction)
				.then((resp) => {
					ToastStore.set({
						message: resp.message,
						title: 'Created Transaction',
						type: 'success'
					});

					if (resp) {
						const thatLog = recordData.logs.find((log) => log.id == resp.data.logId);

						if (thatLog) {
							thatLog?.transactions.push(resp.data);
							const index = recordData.logs.findIndex((log) => log.id === thatLog.id);

							recordData.logs[index] = thatLog;
						}

						setLogs(recordData.logs).then(() => {
							searchLog();
						});

						resolve(true);
					}
				})
				.catch((err) => {
					ToastStore.set({
						title: 'Error occured',
						message: err.message,
						type: 'error'
					});

					resolve(false);
				});
		});
	}

	function updateTransaction(transaction: Transaction): Promise<boolean> {
		const url = `${APIS.TRANSACTIONS}/`;

		return new Promise((resolve) => {
			fetchData(HTTP_METHOD.PUT, url, transaction)
				.then((resp) => {
					ToastStore.set({
						message: resp.message,
						title: 'Updated Transaction',
						type: 'success'
					});

					if (resp) {
						const logIndex = recordData.logs.findIndex((log) => log.id == resp.data.logId);

						if (logIndex > -1) {
							const transactionIndex = recordData.logs[logIndex].transactions.findIndex(
								(transaction) => transaction.id === resp.data.id
							);

							recordData.logs[logIndex].transactions[transactionIndex] = resp.data;
						}

						setLogs(recordData.logs).then(() => {
							searchLog();
						});

						resolve(true);
					}
				})
				.catch((err) => {
					ToastStore.set({
						title: 'Error occured',
						message: err.message,
						type: 'error'
					});

					resolve(false);
				});
		});
	}

	async function onDeleteTransaction(transaction: TransactionDto) {
		modalConfig = {
			foot: {
				cancel: {},
				execute: {
					hideModal: true
				}
			},
			head: {
				title: 'Delete Transaction?'
			},
			body: {
				component: Confirmation,
				props: {
					message: 'You are about to delete this transaction, are you sure you want to do that?'
				}
			}
		};

		const confirmed = await triggerModal({ modalConfig });

		if (confirmed) {
			const id = transaction.id;
			const path = `${APIS.TRANSACTIONS}/${id}`;

			return new Promise((resolve) => {
				fetchData(HTTP_METHOD.DELETE, path, null)
					.then((resp) => {
						ToastStore.set({
							message: 'Successful in deleting transaction',
							title: 'Success',
							type: 'success'
						});

						let indexLog = recordData.logs.findIndex((theLog) => theLog.id === transaction.logId);
						let indexTransaction = recordData.logs[indexLog].transactions.findIndex(
							(theTransaction) => theTransaction.id === id
						);
						recordData.logs[indexLog].transactions.splice(indexTransaction, 1);

						setLogs(recordData.logs).then(() => {
							searchLog();
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
	}

	function getTotalValue($event: CustomEvent<number>) {
		totalValue = $event.detail;
	}

	async function onSpaceAction($event: CustomEvent<SpaceAction>) {
		const spaceAction = $event.detail;

		if (spaceAction.item === SpaceItem.Log) {
			const log = spaceAction.data.log as LogDto;

			modalConfig = {
				foot: {
					cancel: {},
					execute: {
						hideModal: true,
						text: 'Save',
						command: undefined
					}
				},
				head: {
					title: 'Log'
				},
				body: {
					component: LogForm,
					props: {
						logData: {
							...log
						}
					}
				}
			};

			if (spaceAction.action === 'edit') {
				modalConfig.head.title = 'Edit Log';

				modalConfig.foot.execute!.command = updateLog;

				openLogFormModal();
			}

			if (spaceAction.action == 'delete') {
				onDeleteLog(log.id);
			}
		}

		if (spaceAction.item === SpaceItem.Transaction) {
			const transaction = spaceAction.data.transaction as TransactionDto;
			const log = spaceAction.data.log as LogDto;

			if (spaceAction.action !== 'delete') {
				onTransactionForm(spaceAction.action, log, transaction);
			} else {
				onDeleteTransaction(transaction);
			}
		}
	}

	function searchLog() {
		if (searchLogQuery !== '') {
			let filteredLogs = recordData.logs.filter((log) => {
				return (
					log.name.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
					log.value.toString().includes(searchLogQuery.toLowerCase())
				);
			});

			finalLogs = filteredLogs;
		} else {
			finalLogs = recordData.logs;
		}
	}
</script>

<div class="page">
	<div class="top">
		<div class="info">
			<h1>{recordData?.name ?? ''}</h1>
			<p>{recordData?.description ?? ''}</p>
		</div>

		<div class="meta small-text">
			<span>Created since: {recordData?.createdDate.toDateString()}</span>
		</div>
	</div>

	<div class="middle">
		<div class="row">
			<div class="col-sm-4 col-md-4 col-lg-4">
				<button type="button" class="btn btn-primary" on:click={newLog} title="Add Log"
					>New Log</button
				>
			</div>
		</div>

		<div class="row">
			<div class="col-12">
				<hr />
			</div>
		</div>

		<div class="row">
			<div class="col-12">
				<div class="mb-3">
					<label for="searchLog" class="form-label">Search Log</label>
					<input
						type="text"
						class="form-control"
						id="searchLog"
						bind:value={searchLogQuery}
						on:input={searchLog}
					/>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-12">
				<hr />
			</div>
		</div>

		{#if recordData.logs.length > 0}
			<div class="row">
				<div class="col-sm-12 col-md-6 col-lg-6">
					<SpaceField
						logs={finalLogs}
						on:action={onSpaceAction}
						on:total-log-value={getTotalValue}
					/>
				</div>

				<!-- <div class="col-sm-12 col-md-6 col-lg-6">
						<Overview />
					</div> -->
			</div>
		{:else}
			<div class="row">
				<div class="col-sm-12 col-md-6 col-lg-6">
					<p class="p-0">This record has no logs, consider adding one.</p>
				</div>
			</div>
		{/if}
	</div>
</div>
