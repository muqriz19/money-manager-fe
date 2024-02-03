import { goto } from "$app/navigation";
import { StorageItems } from "$lib/data/core";
import type { Writable } from "svelte/store";
import ProfileStore from "../../stores/ProfileStore";
import ToastStore from "../../stores/ToastStore";
import Modal from '../components/Modal.svelte';
import { browser } from "$app/environment";

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
    RESET_PASSWORD = "Authorization/ResetPassword",
    RECORDS = "Records"
}

export interface ResponseBody {
    status: number;
    message: string;
    data: any;
}

export function navigateTo(path: string) {
    goto(path);
}

let globalStore: { [key: string]: Writable<any> } | null = null;

export function fetchData<T>(method: HTTP_METHOD, apiRoutes: APIS | string, bodyItem: T) {
    const headers = new Headers({ 'content-type': 'application/json' });

    const profileData = getData(StorageItems.Profile);

    if (profileData && profileData.token) {
        headers.append('Authorization', `Bearer ${profileData.token}`);
    }

    let options = {
        method: method,
        headers: headers
    };

    let finalPath = `${ROOT_API}${apiRoutes}`;

    if (bodyItem) {
        options = Object.assign(options, { body: JSON.stringify(bodyItem) });
    }

    return fetch(finalPath, options)
        .then((resp) => {
            console.log('RESPONSE ', resp);

            if (!resp.ok) {
                return Promise.reject(resp);
            }

            const respJson = resp.json();

            return respJson;
        })
        .then((respBody: ResponseBody) => {
            console.log('BODY ', respBody);
            return respBody;
        }).catch(async err => {
            const respData = await err.json();
            console.log('ERROR ', respData);

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

    clearStorage();

    navigateTo('/login');
}

export function initGlobalStores() {
    globalStore = {
        [Object.keys({ ProfileStore })[0]]: ProfileStore
    };

    return globalStore;
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
    let data = null;

    data = sessionStorage.getItem(key);

    if (data?.indexOf('[') || data?.indexOf('{')) {
        data = JSON.parse(data);
    } else {
        data = data;
    }

    return data;
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
