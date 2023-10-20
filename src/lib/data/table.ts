export interface TableHeaders {
    name: string;
    canSort: boolean;
    icon: string | null;
    width: string;
}

export interface TableConfig {
    api: {
        path: string;
        queries: TableAPIQuery[];
    },
    dataHandle: {
        pageCount: number;
        property: string;
        dataProps: string[];
        refTotal: string;
    },
    actions: {
        has: {
            edit: boolean;
            delete: boolean;
            view: boolean;
        }
    }
}

export interface TableAPIQuery {
    queryName: string;
    queryValue: string;
}