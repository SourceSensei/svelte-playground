<script>
	import { onMount } from 'svelte';

	let itinerary = null;

	onMount(async () => {
		const url = 'https://rne-simbus.azurewebsites.net/api/v1/Itinerary';

		try {
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					accept: 'application/json'
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json();
			// For demonstration purposes, let's assume we want the first itinerary
			itinerary = data[0];
		} catch (error) {
			console.error(error);
		}
	});
</script>

<main class="main-container">
	{#if itinerary}
		<h1>Itinerary Details</h1>
		<p>Route Code: {itinerary.routeCode}</p>
		<p>Bus Number: {itinerary.busNumber}</p>
		<p>Direction: {itinerary.direction}</p>
		<p
			class="custom-tooltip"
			data-tooltip={itinerary.paths
				? itinerary.paths.map((path) => path.busStation.stationName).join('\n ')
				: ''}
		></p>
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
		top: 2rem;
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
		text-align: left; /* Align text to the left */
		width: max-content;
		max-width: 100%;
		background-color: #333;
		white-space: pre-line; /* Preserve newlines and spaces */
		margin-bottom: 10px; /* Add margin for better spacing */
	}

	.custom-tooltip:hover::before {
		--scale: 1;
	}
</style>
