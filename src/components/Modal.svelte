<script>
	import { onMount } from 'svelte';

	export let showModal;

	function closeModal() {
		showModal = false;
	}

	function handleKeyDown(event) {
		if (event.key === 'Escape') {
			closeModal();
		}
	}

	let routes = [];
	let loading = true;

	onMount(() => {
		fetch('https://rne-simbus.azurewebsites.net/api/v1/Route?PageSize=20&Page=1', {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				return response.json();
			})
			.then((data) => {
				routes = data.sort((a, b) => a.routeCode - b.routeCode);
				loading = false;
			})
			.catch((error) => {
				console.error('Fetch error:', error);
				loading = false;
			});
	});

	// Function to toggle display of stops for a specific route
	function toggleStops(routeCode) {
		// Toggle the 'showStops' property for the specific route
		routes = routes.map((route) => ({
			...route,
			showStops: route.routeCode === routeCode ? !route.showStops : route.showStops
		}));
	}

	function getAllStops(route) {
		const stops = new Set();
		for (const variant of route.routeVariants) {
			for (const itinerary of variant.itineraries) {
				for (const path of itinerary.paths) {
					stops.add(path.busStation.stationName);
				}
			}
		}
		return Array.from(stops);
	}

	// Function to get total stops count for a route
	function getAllStopsCount(route) {
		return getAllStops(route).length;
	}
</script>

{#if showModal}
	<div
		class="modal"
		tabindex="-1"
		role="dialog"
		on:click|self={closeModal}
		on:keydown={handleKeyDown}
	>
		<div class="modal-content" on:click|stopPropagation>
			{#if loading}
				<p>Loading...</p>
			{:else}
				{#each routes as route}
					<div>
						<p>Route Code: {route.routeCode}</p>
						<!-- Button to toggle stops display -->
						<button on:click={() => toggleStops(route.routeCode)}>
							{#if route.showStops}
								<!-- Font Awesome eye icon for showing stops -->
								<i class="fa-solid fa-eye-slash" />
							{:else}
								<!-- Font Awesome eye-slash icon for hiding stops -->
								<i class="fa-solid fa-eye" />
							{/if}
						</button>
						{#if route.showStops}
							<!-- Display total stops for the specific route -->
							<div>
								<h3>Total Stops for Route {route.routeCode}</h3>
								<p>Total Stops: {getAllStopsCount(route)}</p>
								<h3>Stops</h3>
								{#each getAllStops(route) as stop}
									<p>{stop}</p>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			{/if}
			<button on:click={closeModal}>Close</button>
		</div>
	</div>
{/if}

<style>
	.modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.modal-content {
		width: 90%;
		height: 90%;
		background: white;
		padding: 20px;
		border-radius: 5px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		text-align: center;
		justify-content: center;
		align-items: center;
		overflow-x: scroll;
	}
</style>
