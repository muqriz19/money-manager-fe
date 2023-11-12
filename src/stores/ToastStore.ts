import type { ToastType } from "svelte-toasts/types/common";
import { writable } from "svelte/store";

export interface ToastStoreObj {
    message: string;
    type: ToastType;
    title: string;
}

const ToastStore = writable<ToastStoreObj>();

export default ToastStore;