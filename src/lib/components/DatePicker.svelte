<script lang="ts">
	import AirDatepicker from 'air-datepicker';
	import 'air-datepicker/air-datepicker.css';
	import { onMount } from 'svelte';

	import localeEn from 'air-datepicker/locale/en';

	onMount(() => {
		init();
	});

	let defaultLocale = localeEn;

	function init() {
		const datePicker = new AirDatepicker('#datePicker', {
			locale: defaultLocale,

			onSelect: (date) => {}
		});
	}
</script>

<div id="datePicker" />
