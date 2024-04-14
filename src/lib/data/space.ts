import type { Log, Transaction } from "./data";

export type SpaceActions = 'add' | 'delete' | 'edit';

export enum SpaceItem {
    Log,
    Transaction
}

export interface SpaceAction {
    data: {
        log: Log | null;
        transaction: Transaction | null;
    };
    item: SpaceItem;
    action: SpaceActions;
}