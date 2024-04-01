<script lang="ts">
	import type { Log, ProfileData, Record } from '$lib/data/data';
	import { APIS, HTTP_METHOD, fetchData, triggerModal } from '$lib/helpers/utils';
	import { onMount } from 'svelte';
	import ProfileStore from '../../../../../../../stores/ProfileStore';
	import type { ModalConfig } from '$lib/data/modal';
	import LogForm from '$lib/components/logs/LogForm.svelte';
	import ToastStore from '../../../../../../../stores/ToastStore';
	import LogsSpace from '$lib/components/logs/LogsSpace.svelte';
	import Confirmation from '$lib/components/Confirmation.svelte';

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

	onMount(() => {
		console.log(data);

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

				recordData.logs = recordData.logs;

				console.log(recordData);
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
						const allLogs: Log[] = [...currentLogs, log];
						recordData.logs = allLogs;

						recordData.logs = recordData.logs;

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

	async function deleteLog($event: CustomEvent<Log>) {
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
			const currentLog = $event.detail as Log;
			const id = currentLog.id;
			const path = `${APIS.LOGS}/${id}`;

			return new Promise((resolve) => {
				fetchData(HTTP_METHOD.DELETE, path, null)
					.then((resp) => {
						ToastStore.set({
							message: 'Successful in deleting log',
							title: 'Success',
							type: 'success'
						});

						let indexLog = recordData.logs.findIndex((theLog) => theLog.id === id);
						recordData.logs.splice(indexLog, 1);
						recordData.logs = recordData.logs;

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

	async function editLog($event: CustomEvent<Log>) {
		const theLog = $event.detail as Log;

		modalConfig = {
			foot: {
				cancel: {},
				execute: {
					hideModal: true,
					text: 'Update',
					command: updateLog
				}
			},
			head: {
				title: 'Edit Log'
			},
			body: {
				component: LogForm,
				props: {
					logData: {
						...theLog
					}
				}
			}
		};

		openLogFormModal();
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

						const allLogs: Log[] = [...currentLogs];
						recordData.logs = allLogs;

						recordData.logs = recordData.logs;

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

	function getTotalValue($event: CustomEvent<number>) {
		totalValue = $event.detail;
	}
</script>

<div class="page">
	<div class="page-container">
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
					
				</div>
			</div>

			<div class="row">
				<div class="col-sm-12 col-md-12 col-lg-12">
					<LogsSpace
						logs={recordData.logs}
						on:delete={deleteLog}
						on:edit={editLog}
						on:total-log-value={getTotalValue}
					/>
				</div>
			</div>
		</div>
	</div>
</div>
