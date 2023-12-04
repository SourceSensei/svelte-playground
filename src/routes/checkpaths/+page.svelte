<script>
	import { onMount } from 'svelte';

	let totalPaths = 0;
	let variantCode = 1;
	let routeCode = 991;

	const url = `https://rne-simbus.azurewebsites.net/api/v1/Itinerary/${routeCode}/${variantCode}`;
	const options = {
		method: 'GET',
		headers: {
			accept: 'application/json'
		}
	};

	onMount(() => {
		fetch(url, options)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				return response.json();
			})
			.then((data) => {
				// Calculate the total number of paths
				totalPaths = data[0].paths.length;
			})
			.catch((error) => {
				console.error(error);
			});
	});
</script>

<main class="main-container">
	<h1>Check the amount of paths for the selected variant</h1>

	{#if totalPaths}
		<p>Total Paths: {totalPaths} -> routeCode {routeCode} - variant {variantCode}</p>
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
