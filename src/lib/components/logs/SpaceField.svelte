<script lang="ts">
	import {
		TransactionType,
		type Log,
		type LogDto,
		type LogEntry,
		type Transaction,
		type TransactionDto,
		type TransactionEntry
	} from '$lib/data/data';
	import { SpaceItem, type SpaceActions, type SpaceAction } from '$lib/data/space';
	import { createEventDispatcher } from 'svelte';
	import MyIcon from '../MyIcon.svelte';
	import OverviewStore from '../../../stores/OverviewStore';

	const dispatchAction = createEventDispatcher();
	const dispatchValue = createEventDispatcher();

	const dispatchActionIndentifier = 'action';

	export let logs: LogDto[] = [];
	let logEntries: LogEntry[] = [];

	function returnLog(logEntry: LogEntry): Log {
		const allLogs: Log[] = logEntries.map((entry) => {
			let newLog: Log = {
				categoryId: entry.category.id,
				createdDate: entry.createdDate,
				description: entry.description,
				id: entry.id,
				name: entry.name,
				recordId: entry.recordId,
				userId: entry.userId,
				value: entry.value
			};

			return newLog;
		});

		return allLogs.find((log) => log.id === logEntry.id)!;
	}

	function returnLogDto(logEntry: LogEntry): LogDto {
		const allLogs: LogDto[] = logEntries.map((entry) => {
			let newLog: LogDto = {
				category: entry.category,
				categoryId: entry.categoryId,
				createdDate: entry.createdDate,
				description: entry.description,
				id: entry.id,
				name: entry.name,
				recordId: entry.recordId,
				userId: entry.userId,
				value: entry.value,
				transactions: entry.transactions
			};

			return newLog;
		});

		return allLogs.find((log) => log.id === logEntry.id)!;
	}

	function returnTransaction(transactionEntry: TransactionEntry): TransactionDto {
		const newTransaction: TransactionDto = {
			id: transactionEntry.id,
			categoryId: transactionEntry.category.id,
			createdDate: transactionEntry.createdDate,
			description: transactionEntry.description,
			logId: transactionEntry.logId,
			name: transactionEntry.name,
			transactionType: transactionEntry.transactionType,
			userId: transactionEntry.userId,
			value: transactionEntry.value
		};

		return newTransaction;
	}

	function actionSpace(action: SpaceActions, item: SpaceItem, data: LogEntry | TransactionEntry) {
		const spaceAction: SpaceAction = {
			data: {
				log: null,
				transaction: null
			},
			item,
			action
		};

		switch (action) {
			case 'delete':
			case 'edit':
			case 'add':
				if (item === SpaceItem.Log) {
					spaceAction.data.log = returnLog(data as LogEntry);
					dispatchAction(dispatchActionIndentifier, spaceAction);
				}

				if (item === SpaceItem.Transaction) {
					if (spaceAction.action === 'add') {
						spaceAction.data.log = returnLog(data as LogEntry);
					}

					if (spaceAction.action === 'delete' || spaceAction.action === 'edit') {
						spaceAction.data.transaction = returnTransaction(data as TransactionEntry);
					}

					dispatchAction(dispatchActionIndentifier, spaceAction);
				}

				break;

			default:
				break;
		}

		return null;
	}

	function convertLogsToLogEntries(logs: LogDto[]) {
		const allEntries = logs.map((log) => {
			const transactionTotal = calculateTotalAll(log.value, log.transactions);

			return {
				...log,
				value: log.value,
				isCollapsed: false,
				totalValueAll: transactionTotal,
				isDisplayingTransactions: true,
				transactions: log.transactions.map((transaction) => {
					return {
						...transaction,
						isCollapsed: false
					};
				})
			};
		});

		logEntries = allEntries;
	}

	function toggleLog(logEntry: LogEntry) {
		logEntry.isCollapsed = !logEntry.isCollapsed;

		logEntries = logEntries;

		return null;
	}

	function toggleTransaction(transactionEntry: TransactionEntry) {
		transactionEntry.isCollapsed = !transactionEntry.isCollapsed;

		logEntries = logEntries;

		return null;
	}

	function toggleTransactionView(logEntry: LogEntry) {
		logEntry.isDisplayingTransactions = !logEntry.isDisplayingTransactions;

		logEntries = logEntries;

		return null;
	}

	function totalLogValue(logEntries: LogEntry[]) {
		let total = 0;
		logEntries.forEach((logEntry) => {
			total = total + logEntry.value;
		});

		dispatchValue('total-log-value', total);
	}

	function calculateTotalAll(logValue: number, allTransactions: Transaction[]) {
		let value = 0;

		if (allTransactions.length > 0) {
			value = logValue;
		}

		allTransactions.forEach((transaction) => {
			if (transaction.transactionType === TransactionType.Income) {
				value += transaction.value;
			} else {
				value -= transaction.value;
			}
		});

		return value;
	}

	function overviewLog(logEntry: LogEntry) {
		OverviewStore.set(returnLogDto(logEntry));
		return null;
	}

	$: convertLogsToLogEntries(logs);
	$: totalLogValue(logEntries);
</script>

<div class="log-space-wrapper">
	{#each logEntries as logEntry}
		{#if logEntry.isCollapsed}
			<div class="actions">
				<button
					type="button"
					title="Remove log"
					on:click={actionSpace('delete', SpaceItem.Log, logEntry)}
				>
					<i class="bi bi-trash" />
				</button>

				<button
					type="button"
					title="Edit log"
					on:click={actionSpace('edit', SpaceItem.Log, logEntry)}
				>
					<i class="bi bi-pencil" />
				</button>

				<button type="button" title="Info about this log" on:click={overviewLog(logEntry)}>
					<i class="bi bi-info" />
				</button>

				<button
					type="button"
					title="{logEntry.isDisplayingTransactions ? 'Hide' : 'Show'} Transaction"
					on:click={toggleTransactionView(logEntry)}
				>
					<i class="bi bi-{logEntry.isDisplayingTransactions ? 'eye-slash' : 'eye'}" />
				</button>
			</div>
		{/if}

		<button type="button" class="space-box" on:click={toggleLog(logEntry)}>
			<div class="icon">
				<MyIcon
					iconSet={{ set: logEntry.category.iconSet, name: logEntry.category.iconName }}
					extraClass="ignoreIconOption"
				/>
			</div>

			<div class="info">
				<div class="label">
					<span>
						{logEntry.name}
					</span>

					<div class="value-container">
						<span class="value">
							{logEntry.value}
						</span>

						=

						<span class="value" title="Balance">
							{logEntry.totalValueAll}
						</span>
					</div>
				</div>

				<hr />

				<div class="meta">
					<p class="small-text p-0 m-0">
						{logEntry.description ?? ''}
					</p>
					<span class="small-text">
						{new Date(logEntry.createdDate).toDateString()}
					</span>
				</div>
			</div>
		</button>

		{#if logEntry.isDisplayingTransactions}
			<div class="actions">
				<button
					type="button"
					title="Add transaction"
					on:click={actionSpace('add', SpaceItem.Transaction, logEntry)}
				>
					<i class="bi bi-plus" />
				</button>
			</div>

			<div class="transactions-space-wrapper">
				{#each logEntry.transactions as transactionEntry}
					{#if transactionEntry.isCollapsed}
						<div class="actions">
							<button
								type="button"
								title="Remove transaction"
								on:click={actionSpace('delete', SpaceItem.Transaction, transactionEntry)}
							>
								<i class="bi bi-trash" />
							</button>

							<button
								type="button"
								title="Edit transaction"
								on:click={actionSpace('edit', SpaceItem.Transaction, transactionEntry)}
							>
								<i class="bi bi-pencil" />
							</button>
						</div>
					{/if}

					<button
						type="button"
						class="space-box {transactionEntry.transactionType === TransactionType.Income
							? 'incomeBg'
							: 'expenseBg'}"
						on:click={toggleTransaction(transactionEntry)}
					>
						<div class="icon">
							<MyIcon
								iconSet={{
									set: transactionEntry.category.iconSet,
									name: transactionEntry.category.iconName
								}}
								extraClass="ignoreIconOption"
							/>
						</div>

						<div class="info">
							<div class="label">
								<span>
									{transactionEntry.name}
								</span>

								<div class="value-container">
									<span class="value">
										{transactionEntry.value}
									</span>
								</div>
							</div>

							<hr />

							<div class="meta">
								<p class="small-text p-0 m-0">
									{transactionEntry.description ?? ''}
								</p>
								<span class="small-text">
									{new Date(transactionEntry.createdDate).toDateString()}
								</span>
							</div>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	{/each}
</div>

<style lang="scss">
	@mixin space-box {
		padding: 10px;
		border-radius: 5px;
		border: 0;
		cursor: pointer;

		display: flex;
		gap: 1rem;
		align-items: center;

		.info {
			display: flex;
			flex: 1;
			flex-direction: column;

			.meta {
				text-align: left;
			}
		}

		.label {
			display: flex;
			flex: 1;

			.value-container {
				.value {
					@include value;
				}
			}

			span:first-child {
				flex-grow: 1;
				text-align: left;
			}
		}
	}

	@mixin value {
		padding: 5px;
		border-radius: 5px;
		font-weight: 600;
		background-color: $white-color;
	}

	.log-space-wrapper {
		display: grid;
		grid-template-columns: 100%;
		row-gap: 10px;

		.space-box {
			background-color: #23c723;

			@include space-box();
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
			grid-template-columns: 80%;
			row-gap: 10px;
			justify-content: end;

			.space-box {
				margin-left: 20px;

				@include space-box();
			}
		}
	}

	.incomeBg {
		background-color: $light-green-color !important;
	}

	.expenseBg {
		background-color: $red-color !important;
	}
</style>
