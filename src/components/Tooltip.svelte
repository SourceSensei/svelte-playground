<script>
	import '../global.css';
	import { onMount } from 'svelte';

	let routes = [];
	let tooltipText = '';
	let route1 = 1; // Hardcoded value for testing purposes

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

			tooltipText = generateTooltipText(routes);

			routes.forEach((route) => {
				route.showTooltip = false;
				route.stationNames = getStationNames(route);
			});
		} catch (error) {
			console.error(error);
		}
	}

	function generateTooltipText(routes) {
		const stopNames = new Set();
		routes.forEach((route) => {
			for (const variant of route.routeVariants) {
				for (const itinerary of variant.itineraries) {
					for (const path of itinerary.paths) {
						stopNames.add(path.busStation.stationName);
					}
				}
			}
		});
		return Array.from(stopNames).join(', ');
	}

	function getTotalStops(route) {
		const totalStopsSet = new Set();
		for (const variant of route.routeVariants) {
			for (const itinerary of variant.itineraries) {
				for (const path of itinerary.paths) {
					totalStopsSet.add(path.busStation.stationName);
				}
			}
		}
		return totalStopsSet.size;
	}

	function getStationNames(route) {
		const stationNames = new Set();
		for (const variant of route.routeVariants) {
			for (const itinerary of variant.itineraries) {
				for (const path of itinerary.paths) {
					stationNames.add(path.busStation.stationName);
				}
			}
		}
		return Array.from(stationNames);
	}

	function getTotalStopsForRoute1() {
		const route1Object = routes.find((route) => route.routeCode === route1);
		if (route1Object) {
			return getTotalStops(route1Object);
		}
		return 0;
	}

	onMount(async () => {
		await fetchRoutes();
	});
</script>

<main class="main-container">
	<h1>Welcome to SvelteKit Playground</h1>
	<button on:click={fetchRoutes}>Get Routes</button>

	{#if routes.length > 0}
		<div class="route-container">
			<!-- Display total stops only for route 1 -->
			<p>Total Stops for Route 1: {getTotalStopsForRoute1()}</p>

			{#each routes as route (route.id)}
				<p>{route.origin} to {route.destination}</p>

				<!-- Display button to show tooltip for route 1 -->
				{#if route.routeCode === route1}
					<button
						on:mouseover={() => (route.showTooltip = true)}
						on:mouseout={() => (route.showTooltip = false)}
					>
						Hover for Stations (Route {route1})
					</button>
				{/if}

				<!-- Display tooltip for route 1 -->
				{#if route.showTooltip && route.routeCode === route1}
					<div class="station-names" bind:this={route.tooltipRef}>
						{#each route.stationNames as stationName (stationName)}
							<p>{stationName}</p>
						{/each}
					</div>
				{/if}
			{/each}
		</div>
	{:else}
		<p>No routes available</p>
	{/if}

	<!-- ... (rest of your code) -->
</main>

<div class="avatar" data-tooltip={tooltipText}></div>

<style>
	.main-container {
		text-align: center;
		padding: 1em;
	}

	.station-names {
		display: none;
		position: absolute;
		top: 0;
		left: 0;
		background-color: white;
		box-shadow: 0px 0px 5px 0px #000000;
		padding: 10px;
	}

	.route-container button:hover + .station-names {
		display: block;
	}
</style>
