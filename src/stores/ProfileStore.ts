import type { ProfileData } from "$lib/data/data";
import { writable } from "svelte/store";

const ProfileStore = writable<ProfileData>();

export default ProfileStore;