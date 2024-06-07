export interface TableHeader {
	name: string;
	canSort: boolean;
	width: string;
}

export interface TableConfig {
	api: {
		path: string;
		queries: TableAPIQuery[];
		search: {
			query: TableAPIQuery | null;
		};
	};
	dataHandle: {
		pageCount: number;
		property: string;
		dataProps: DataProp[];
		refTotal: string;
	};
	actions: {
		has: {
			edit: boolean;
			delete: boolean;
			view: boolean;
		};
		methods?: {
			editRow?: ActionMethod;
			delete: DeleteMethodFeature;
			viewRow?: ActionMethod;
		};
	};
}

type DataPropCommand = (row: any) => any;
type ActionMethod = (rowData: any) => any;

export interface DataProp {
	name: string;
	command?: DataPropCommand;
}

export interface DeleteMethodFeature {
	deleteRow?: ActionMethod;
	refresh: boolean;
}

export interface TableAPIQuery {
	queryName: string;
	queryValue: string;
}
