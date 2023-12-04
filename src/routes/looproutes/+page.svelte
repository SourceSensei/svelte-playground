<script>
	import { onMount } from 'svelte';

	let routes = [];

	onMount(() => {
		const url = 'https://rne-simbus.azurewebsites.net/api/v1/Route?PageSize=186&Page=1';

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
				routes = data;
			})
			.catch((error) => {
				console.error(error);
			});
	});
</script>

<main class="main-container">
	<h1>All Routes</h1>

	{#if routes.length > 0}
		<ul>
			{#each routes as route (route.id)}
				<li>{route.routeCode}</li>
			{/each}
		</ul>
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

	ul {
		list-style-type: none;
		padding: 0;
	}

	li {
		margin: 0.5em;
	}
</style>
