import type { Log } from "$lib/data/data";
import { writable } from "svelte/store";

const LogsStore = writable<Log | []>();

export default LogsStore;