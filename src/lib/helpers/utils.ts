import { goto } from "$app/navigation";
import type { StorageItems } from "$lib/data/core";
import ToastStore from "../../stores/ToastStore";
import Modal from '../components/Modal.svelte';

const ROOT_API = "http://localhost:5133/api/";

export enum HTTP_METHOD {
    GET = 'GET',
    POST = 'POST',
    DELETE = 'DELETE',
    PUT = 'PUT'
}

export enum APIS {
    ACCOUNTS = "Accounts",
    CATEGORIES = "Categories",
    REGISTER = "Authorization/Register",
    Login = "Authorization/Login",
    FORGOT_PASSWORD = "Authorization/ForgotPassword",
    RESET_PASSWORD = "Authorization/ResetPassword"
}

export interface ResponseBody {
    status: number;
    message: string;
    data: any;
}

export function navigateTo(path: string) {
    goto(path);
}

export function fetchData<T>(methods: HTTP_METHOD, apiRoutes: APIS | string, bodyItem: T) {
    let options = {
        method: methods,
        headers: new Headers({ 'content-type': 'application/json' })
    };

    let finalPath = `${ROOT_API}${apiRoutes}`;

    if (bodyItem) {
        options = Object.assign(options, { body: JSON.stringify(bodyItem) });
    }

    return fetch(finalPath, options)
        .then((resp) => {
            const respJson = resp.json();
            console.log('RESPONSE ', resp);

            if (!resp.ok) {
                return Promise.reject(respJson);
            }

            return respJson;
        })
        .then((respBody: ResponseBody) => {
            console.log(respBody);
            return respBody;
        }).catch(async err => {
            const respData = await err;

            if (respData && respData.status === 401) {
                unauthorizedRequest();
            }

            throw respData;
        });
}

function unauthorizedRequest() {
    ToastStore.set({
        title: 'Unauthorized Login',
        message: "Please login to use the application",
        type: 'error'
    });

    navigateTo('/login');
}

let timeout: NodeJS.Timeout | null = null;
export function debounce(milliSeconds: number, functionCode: Function) {

    if (timeout) {
        clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
        functionCode();
    }, milliSeconds);
}

export function saveData(data: any, key: StorageItems) {
    if (typeof data === 'object') {
        sessionStorage.setItem(key, JSON.stringify(data));
    } else {
        sessionStorage.setItem(key, data);
    }
}

export function getData(key: StorageItems) {
    let data = sessionStorage.getItem(key);

    if (data?.indexOf('[') || data?.indexOf('{')) {
        return JSON.parse(data);
    } else {
        return data;
    }
}

// Reference https://svelte.dev/repl/15d7c21aa036464cb0220af60dde3843?version=3.48.0
export function confirmAction(options: any) {
    return new Promise(resolve => {
        const modal = new Modal({
            target: document.body,
            props: options,
        });
        modal.$on('result', e => {
            resolve(e.detail);
            modal.$destroy();
        });
    })
}

export function clearStorage() {
    sessionStorage.clear();
}