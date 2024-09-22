import { goto } from '$app/navigation';
import { StorageItems } from '$lib/data/core';
import type { Writable } from 'svelte/store';
import ProfileStore from '../../stores/ProfileStore';
import ToastStore from '../../stores/ToastStore';
import Modal from '../components/Modal.svelte';

import { PUBLIC_API_URL } from '$env/static/public';

// const ROOT_API = 'http://localhost:5133/api/';
const ROOT_API = PUBLIC_API_URL;

export enum HTTP_METHOD {
	GET = 'GET',
	POST = 'POST',
	DELETE = 'DELETE',
	PUT = 'PUT'
}

export enum APIS {
	ACCOUNTS = 'Accounts',
	CATEGORIES = 'Categories',
	REGISTER = 'Authorization/Register',
	Login = 'Authorization/Login',
	FORGOT_PASSWORD = 'Authorization/ForgotPassword',
	RESET_PASSWORD = 'Authorization/ResetPassword',
	RECORDS = 'Records',
	LOGS = 'Logs',
	TRANSACTIONS = 'Transactions'
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

	let profileData = null;

	if (!apiRoutes.toLowerCase().includes('login')) {
		profileData = getData(StorageItems.Profile);

		if (profileData && profileData.token) {
			headers.append('Authorization', `Bearer ${profileData.token}`);
		}
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
		.then(async (resp) => {
			console.log('RESPONSE ', resp);

			if (!resp.ok) {
				throw resp;
			} else {
				return resp.json();
			}
		})
		.catch(async (err) => {
			console.log('ERROR BEFORE ', err);

			if (err && err.status === 401) {
				unauthorizedRequest();
			}

			let respData = await err.json();
			console.log('ERROR ', respData.status);

			throw respData;
		});
}

function unauthorizedRequest() {
	ToastStore.set({
		title: 'Unauthorized Login',
		message: 'Please login to use the application',
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

let modalReference: Modal | null = null;

// Reference https://svelte.dev/repl/15d7c21aa036464cb0220af60dde3843?version=3.48.0
export function triggerModal(options: any) {
	return new Promise((resolve) => {
		modalReference = new Modal({
			target: document.body,
			props: options
		});

		modalReference.$on('result', (e) => {
			resolve(e.detail);
			if (modalReference) {
				modalReference.hideModal();
				modalReference.$destroy();

				modalReference = null;
			}
		});
	});
}

export function getCurrentModalReference(): Promise<Modal | null> {
	return new Promise((resolve) => {
		resolve(modalReference);
	});
}

export function clearStorage() {
	sessionStorage.clear();
}

export function generateRandomId(length: number) {
	const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let randomId = '';
	for (let i = 0; i < length; i++) {
		randomId += characters.charAt(Math.floor(Math.random() * characters.length));
	}

	return randomId;
}

type EnumValue = 'strings' | 'numbers';
export function getEnumsValues(whatType: EnumValue, enums: any): number[] | string[] {
	const enumNumbers: number[] = [];
	const enumStrings: string[] = [];

	Object.keys(enums)
		.filter((type) => !Number.isNaN(Number(type).valueOf()))
		.map((filteredType) => {
			const enumNumber = Number(filteredType);
			const enumString = enums[enumNumber];

			enumNumbers.push(enumNumber);
			enumStrings.push(enumString);
		});

	if (whatType === 'numbers') {
		return enumNumbers;
	} else {
		return enumStrings;
	}
}
