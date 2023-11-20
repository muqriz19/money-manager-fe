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

export interface User {
    id?: number;
    name: string;
    email: string;
    password: string;
    createdDate: Date;
}

export interface Login {
    name: string;
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
}