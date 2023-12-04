<script>
	import '../global.css';
	import { onMount } from 'svelte';

	let routes = [];

	const url = 'https://rne-simbus.azurewebsites.net/api/v1/Route';
	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	};

	async function fetchRoutes() {
		try {
			const response = await fetch(url, options);
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			routes = await response.json();
			console.log(routes);
		} catch (error) {
			console.error(error);
		}
	}

	onMount(fetchRoutes);
</script>

<main class="main-container">
	<h1>Welcome to SvelteKit Playground</h1>
	<button on:click={fetchRoutes}>Get Routes</button>

	{#if routes.length > 0}
		{#each routes as route (route.id)}
			<p>{route.origin} to {route.destination}</p>
		{/each}
	{:else}
		<p>No routes available</p>
	{/if}
</main>

<style>
	.main-container {
		text-align: center;
		padding: 1em;
	}
</style>
