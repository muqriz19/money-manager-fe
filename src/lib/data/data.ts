export interface Account {
    id: number;
    name: string;
    description: string | null;
    createdDate: Date;
    userId: number;
}

export interface Category {
    id?: number;
    name: string;
    description: string | null;
    createdDate: Date;
    iconName: string;
    iconSet: string;
    userId: number;
}

export interface User {
    id?: number;
    name: string;
    email: string;
    password: string;
    createdDate: Date;
}

export interface Login {
    email: string;
    password: string;
}

export interface ForgotPassword {
    email: string;
}

export interface ResetPassword {
    email: string;
    newPassword: string;
}

export interface ProfileData {
    email: string;
    name: string;
    token: string;
    createdDate: string;
    userId: number;
}

export interface Record {
    id: number;
    name: string;
    description: string | null;
    createdDate: Date;
    userId: number;
    accountId: number;
    logs: Log[] | null;
}

export interface Log {
    id: number;
    name: string;
    description: string | null;
    createdDate: Date;
    value: number;
    userId: number;
    recordId: number;
    categoryId: number;
}

export type LoaderType = 'regular';