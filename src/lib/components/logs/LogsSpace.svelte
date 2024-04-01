<script lang="ts">
	import type { Log } from '$lib/data/data';
	import { createEventDispatcher } from 'svelte';

	const dispatchAction = createEventDispatcher();
	const dispatchValue = createEventDispatcher();

	export let logs: Log[] = [];
	let logEntries: LogEntry[] = [];

	type actions = 'edit' | 'delete';

	interface LogEntry extends Log {
		isCollapsed: boolean;
	}

	function returnLog(logEntry: LogEntry) {
		return logEntries.find((log) => log.id === logEntry.id);
	}

	function actionsLog(action: actions, logEntry: LogEntry) {
		dispatchAction(action, returnLog(logEntry));

		return null;
	}

	function convertLogsToLogEntries(logs: Log[]) {
		const allEntries = logs.map((log) => {
			return {
				...log,
				isCollapsed: false
			};
		});

		logEntries = allEntries;
	}

	function toggleLog(logEntry: LogEntry) {
		logEntry.isCollapsed = !logEntry.isCollapsed;

		logEntries = logEntries;

		return null;
	}

	function totalLogValue(logEntries: LogEntry[]) {
		let total = 0;
		logEntries.forEach((logEntry) => {
			total = total + logEntry.value;
		});

		console.log(total);

		dispatchValue('total-log-value', total);
	}

	$: convertLogsToLogEntries(logs);
	$: totalLogValue(logEntries);
</script>

<div class="log-space-wrapper">
	{#each logEntries as logEntry}
		{#if logEntry.isCollapsed}
			<div class="actions">
				<button type="button" title="Remove log" on:click={actionsLog('delete', logEntry)}>
					<i class="bi bi-trash" />
				</button>

				<button type="button" title="Edit log" on:click={actionsLog('edit', logEntry)}>
					<i class="bi bi-pencil" />
				</button>
			</div>
		{/if}

		<button type="button" class="log-space" on:click={toggleLog(logEntry)}>
			<div class="category-icon" />

			<div class="category-label">
				<span>
					{logEntry.name}
				</span>

				<span>
					{logEntry.value}
				</span>
			</div>
		</button>

		<div class="actions">
			<button type="button" title="Add transaction">
				<i class="bi bi-plus" />
			</button>
		</div>

		<div class="transactions-space-wrapper">
			<!-- {#each [1, 2, 3, 4] as transaction}
				<div class="transaction-space">
					{transaction}
				</div>
			{/each} -->
		</div>
	{/each}
</div>

<style lang="scss">
	.log-space-wrapper {
		display: grid;
		grid-template-columns: 250px;
		row-gap: 10px;

		.log-space {
			height: 50px;
			padding: 10px;
			border-radius: 5px;
			background-color: #23c723;
			border: 0;
			cursor: pointer;

			.category-label {
				display: flex;

				span:first-child {
					flex-grow: 1;
					text-align: left;
				}
			}
		}

		.actions {
			display: flex;
			flex-direction: row-reverse;
			gap: 5px;

			button {
				border-radius: 5px;
				border: 1px solid $light-grey-color;
			}
		}

		.transactions-space-wrapper {
			display: grid;
			grid-template-columns: 250px;
			row-gap: 10px;

			.transaction-space {
				cursor: pointer;

				height: 50px;
				padding: 10px;
				border-radius: 5px;
				background-color: $light-green-color;
				box-shadow: 0px 2px 2px -1px $grey-color;
				margin-left: 20px;
			}
		}
	}
</style>
