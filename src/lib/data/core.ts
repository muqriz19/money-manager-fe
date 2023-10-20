export interface RouteItem {
    path: string;
    name: string;
    children?: RouteItem[];
    metaData?: RouteMetaData
}

export interface RouteMetaData {
    data: any;
}