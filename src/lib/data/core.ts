export interface RouteItem {
    path: string;
    name: string;
    children?: RouteItem[];
    metaData?: RouteMetaData;
    command?: RouteCommand;
}

type RouteCommand = ($event: any) => any;

export interface RouteMetaData {
    data: any;
}

export enum StorageItems {
    Accounts = 'Accounts',
    Categories = 'Categories',
    Profile = "Profile",
    Records = "Records"
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