<script lang="ts">
	import type { Log, ProfileData, Record } from '$lib/data/data';
	import { HTTP_METHOD, fetchData, navigateTo, triggerModal } from '$lib/helpers/utils';
	import { onMount } from 'svelte';
	import ProfileStore from '../../../../../../../stores/ProfileStore';
	import type { ModalConfig } from '$lib/data/modal';
	import LogForm from '$lib/components/logs/LogForm.svelte';

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

	let modalConfig: ModalConfig = {
		foot: {
			cancel: {},
			execute: {
				hideModal: true,
				text: 'Save'
			}
		},
		head: {
			title: 'New Log'
		},
		body: {
			component: LogForm,
			props: { logData: {} }
		}
	};

	onMount(() => {
		console.log(data);

		ids.userId = Number(data.userId);
		ids.accountId = Number(data.accountId);
		ids.id = Number(data.recordId);

		(modalConfig.body.props.logData as Log) = {
			categoryId: 0,
			createdDate: new Date(),
			description: null,
			id: 0,
			name: '',
			recordId: ids.id,
			userId: ids.userId,
			value: 0
		};

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
			console.log(respData);

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

				console.log(recordData);
			}
		});
	}

	async function openLogModal() {
		let response = await triggerModal({ modalConfig });

		console.log(response);
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
					<button type="button" class="btn btn-primary" on:click={openLogModal}>New Log</button>
				</div>
			</div>
		</div>
	</div>
</div>
