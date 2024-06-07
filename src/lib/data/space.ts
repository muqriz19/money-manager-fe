import type { Log, LogDto, Transaction, TransactionDto } from './data';

export type SpaceActions = 'add' | 'delete' | 'edit';

export enum SpaceItem {
	Log,
	Transaction
}

export interface SpaceAction {
	data: {
		log: Log | null;
		transaction: TransactionDto | null;
	};
	item: SpaceItem;
	action: SpaceActions;
}
