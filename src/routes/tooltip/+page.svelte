<script>
	import { onMount } from 'svelte';

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
		<h1>Check route code with tooltip</h1>
		<p
			class="custom-tooltip"
			data-tooltip={route.availableStations.map((station) => station.stationName).join(', ')}
		></p>

		<h2>Stops on the Route:</h2>
		<ul>
			{#each route.availableStations as { stationCode, stationName }}
				<li>{stationName}</li>
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
		min-height: 100vh;
		margin: 0;
	}

	.custom-tooltip {
		width: 300px;
		height: 300px;
		border-radius: 50%;
		background-image: url('https://www.akc.org/wp-content/uploads/2017/11/Chinook-On-White-03.jpg');
		background-size: cover;
		background-position: center;
		position: relative;
	}

	.custom-tooltip::before,
	.custom-tooltip::after {
		--scale: 0;
		position: absolute;
		top: -0.25rem;
		left: 50%;
		transform: translateX(-50%) translateY(-100%) scale(var(--scale));
		transition: 150ms transform ease-in-out;
		transform-origin: bottom center;
	}

	.custom-tooltip::before {
		content: attr(data-tooltip);
		color: white;
		padding: 0.5rem;
		border-radius: 0.3rem;
		text-align: center;
		width: max-content;
		max-width: 100%;
		background-color: #333;
	}

	.custom-tooltip:hover::before {
		--scale: 1;
	}
</style>
