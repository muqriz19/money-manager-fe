export interface Account {
    id: number;
    name: string;
    description: string | null;
    createdDate: Date;
}

export interface Category {
    id?: number;
    name: string;
    description: string | null;
    createdDate: Date;
    iconName: string;
    iconSet: string;
}