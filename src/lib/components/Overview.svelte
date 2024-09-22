<script lang="ts">
	import { onMount } from 'svelte';
	import OverviewStore from '../../stores/OverviewStore';
	import { debounce } from '$lib/helpers/utils';
	import { TransactionType, type LogDto } from '$lib/data/data';
	import ChartJs from 'chart.js/auto';

	let isOverviewOpen = false;
	let log: LogDto;

	function offOverview() {
		isOverviewOpen = false;
	}

	onMount(() => {
		OverviewStore.subscribe((theLog) => {
			if (theLog) {
				isOverviewOpen = true;
				log = theLog;

				debounce(1000, setupChart);
			}
		});
	});

	function setupChart() {
		setupTransactionType(log);
	}

	function setupTransactionType(log: LogDto) {
		let totalExpense = 0;
		let totalIncome = 0;

		for (let transaction of log.transactions) {
			if (transaction.transactionType === TransactionType.Expenses) {
				totalExpense += 1;
			}

			if (transaction.transactionType === TransactionType.Income) {
				totalIncome += 1;
			}
		}

		const barMap = new Map();
		barMap.set(TransactionType.Expenses, { label: 'Expenses', value: totalExpense });
		barMap.set(TransactionType.Income, { label: 'Income', value: totalIncome });

		const TESTER = document.getElementById('transactionTypeChart') as HTMLCanvasElement;

		new ChartJs(TESTER, {
			type: 'pie',
			data: {
				labels: [
					barMap.get(TransactionType.Expenses).label,
					barMap.get(TransactionType.Income).label
				],
				datasets: [
					{
						data: [
							barMap.get(TransactionType.Expenses).value,
							barMap.get(TransactionType.Income).value
						],
						backgroundColor: ['red', 'green']
					}
				]
			}
		});
	}
</script>

<div class="overview-wrapper">
	<div class="top-bar">
		<h3>Overview</h3>

		{#if isOverviewOpen}
			<button type="button" class="fab" on:click={offOverview}>
				<i class="bi bi-x" />
			</button>
		{/if}
	</div>

	<div class="middle-bar">
		{#if isOverviewOpen}
			<div class="block-table">
				<canvas id="transactionTypeChart" style="height:250px;" />
			</div>
		{:else}
			<p class="text-center">Select a log to view information about it</p>
		{/if}
	</div>
</div>

<style lang="scss">
	.overview-wrapper {
		border-radius: 5px;
		padding: 10px;
		background-color: $yellow-color;
		position: relative;

		.top-bar {
			text-align: center;
		}
	}
</style>
