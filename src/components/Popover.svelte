<script>
	import { onMount } from 'svelte';

	let button;
	let route1;
	let loading = true;

	onMount(() => {
		new bootstrap.Popover(button);
		fetchRoute1();
	});

	// Function to update popover content dynamically
	function updatePopoverContent() {
		if (button && route1) {
			button.setAttribute(
				'data-bs-content',
				`Total Stops: ${getAllStopsCount()}<div>${getAllStops()
					.map((stop) => `<p>${stop}</p>`)
					.join('')}</div>`
			);
		}
	}

	// Function to get all stops for Route 1
	function getAllStops() {
		if (!route1) {
			return [];
		}

		const stops = new Set();
		for (const variant of route1.routeVariants) {
			for (const itinerary of variant.itineraries) {
				for (const path of itinerary.paths) {
					stops.add(path.busStation.stationName);
				}
			}
		}
		return Array.from(stops);
	}

	// Function to get total stops count for Route 1
	function getAllStopsCount() {
		return getAllStops().length;
	}

	async function fetchRoute1() {
		try {
			const response = await fetch('https://rne-simbus.azurewebsites.net/api/v1/Route/1', {
				method: 'GET',
				headers: {
					Accept: 'application/json'
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json();
			route1 = data;
			loading = false;

			// Update the popover content dynamically after fetching the data
			updatePopoverContent();
		} catch (error) {
			console.error('Fetch error:', error);
			loading = false;
		}
	}
</script>

<div class="container mt-3">
	<h3 class="p-3">Check All Cities For Route 1</h3>

	<button
		type="button"
		class="btn btn-primary"
		bind:this={button}
		data-bs-toggle="popover"
		title="Stops for Route 1"
	>
		Toggle popover
	</button>
</div>

<style>
	.container {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
