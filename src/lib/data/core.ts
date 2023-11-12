export interface RouteItem {
    path: string;
    name: string;
    children?: RouteItem[];
    metaData?: RouteMetaData
}

export interface RouteMetaData {
    data: any;
}

export enum StorageItems {
    Accounts = 'Accounts',
    Categories = 'Categories'
}

export interface IconSet {
    name: string;
    set: string;
    icons: string[]
}

export interface SelectedIcon {
    set: string;
    name: string
}