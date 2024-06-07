import type { LogDto } from '$lib/data/data';
import { writable } from 'svelte/store';

const OverviewStore = writable<LogDto>();

export default OverviewStore;
