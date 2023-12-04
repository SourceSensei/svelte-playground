<script>
	import { onMount } from 'svelte';
	import '../../global.css';

	let route = null;

	onMount(() => {
		const routeId = 9;
		const url = `https://rne-simbus.azurewebsites.net/api/v1/Route/${routeId}`;

		fetch(url, {
			method: 'GET',
			headers: {
				accept: 'application/json'
			}
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				return response.json();
			})
			.then((data) => {
				route = data;
			})
			.catch((error) => {
				console.error(error);
			});
	});
</script>

<main class="main-container">
	{#if route}
		<h1>Check route code</h1>
		<p>Nº: {route.routeCode}</p>
		<p>Origem: {route.origin}</p>
		<p>Destino: {route.destination}</p>
		<p>Localidades: {route.availableStations.length}</p>
		<p>Variantes: {route.numberOfVariants}</p>
		<p>Circulações: {route.numberOfItineraries}</p>
	{:else}
		<p>Loading...</p>
	{/if}
</main>

<style>
	.main-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		padding: 1em;
	}
</style>
