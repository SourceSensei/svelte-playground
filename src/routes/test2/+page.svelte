<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let updating = false;
	$: loading = updating;

	// Itinerary Details Store
	let itineraryDetailsStore = writable({
		paths: [
			{
				itineraryPathId: '',
				busStation: {
					stationCode: null,
					stationName: ''
				},
				sequenceOrder: null,
				departureTime: {
					hour: 9,
					minute: 0
				},
				arrivalTime: null,
				waitingTime: null
			}
		],
		periodFrequencies: [],
		holidayRules: [],
		departureStation: {
			stationCode: null,
			stationName: ''
		},
		arrivalStation: {
			stationCode: null,
			stationName: ''
		},
		routeCode: null,
		itineraryNumber: null,
		companyCode: null,
		busNumber: '',
		beginDate: null,
		endDate: null,
		direction: '',
		isActive: true,
		frequency: {
			frequencyCode: null,
			weekDays: null,
			holidaysActions: []
		}
	});

	$: itineraryDetails = $itineraryDetailsStore;

	let fetchItineraryDetails = async () => {
		const url = 'https://rne-simbus.azurewebsites.net/api/v1/Itinerary/1/3';
		const options = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		};

		try {
			const response = await fetch(url, options);
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json();
			console.log(data);

			itineraryDetailsStore.set(data);
		} catch (error) {
			console.error(error);
		}
	};

	let betweenStopsDetailsStore = writable({
		id: '',
		from: {
			stationCode: null,
			stationName: ''
		},
		to: {
			stationCode: null,
			stationName: ''
		},
		totalDistanceInKm: null,
		totalTime: {
			hour: null,
			minute: null
		},
		totalTimeWithMargin: {
			hour: null,
			minute: null
		}
	});

	$: stopDetails = $betweenStopsDetailsStore;

	const stopDetailsFetch = async (stationCode1, stationCode2) => {
		const url = `https://rne-simbus.azurewebsites.net/api/v1/DistancesBetweenLocations/${stationCode1}/${stationCode2}`;
		const options = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		};

		try {
			const response = await fetch(url, options);
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json();
			console.log(data);

			// Use betweenStopsDetailsStore instead of betweenStopsDetailsStore
			betweenStopsDetailsStore.set(data);
		} catch (error) {
			console.error(error);
		}
	};

	const addEmptySelectAndTimeInputs = () => {
		console.log('Adding empty select and time inputs...');

		const newEmptyPath = {
			itineraryPathId: generateUniqueId(),
			routeCode: null,
			busStation: {
				stationCode: null,
				stationName: ''
			},
			departureTime: { hour: 0, minute: 0 },
			arrivalTime: { hour: 0, minute: 0 },
			waitingTime: { hour: 0, minute: 0 }
		};

		itineraryDetailsStore.update((storeValue) => {
			const paths = [...storeValue.paths];

			// Insert the new empty path between the first and last stations
			paths.splice(1, 0, newEmptyPath);

			return {
				...storeValue,
				paths
			};
		});
	};

	const generateUniqueId = () => {
		return '_' + Math.random().toString(36).substr(2, 9);
	};

	// Existing code remains unchanged

	onMount(async () => {
		try {
			updating = true;

			// Fetch data and perform other initializations
			await fetchItineraryDetails();
			await stopDetailsFetch(402, 1);
		} catch (error) {
			console.error('Error fetching itinerary details:', error);
		} finally {
			updating = false;
		}
	});
</script>

<div class="d-flex flex-row justify-content-start">
	<div><h5>Paragens</h5></div>
	<div>
		<button class="btn btn-sm btn-primary" on:click={addEmptySelectAndTimeInputs}
			>Adicionar +</button
		>
	</div>
</div>

<div class="d-flex flex-row">
	<div class="d-flex flex-column">
		<!-- Rendering for the newly added path -->
		{#each itineraryDetails.paths as path, index (path.itineraryPathId)}
			<div class="mb-4">
				<select
					id={`stationInput_${path.itineraryPathId}`}
					name={`stationInput_${path.itineraryPathId}`}
					class="custom-select"
					value={itineraryDetails.paths[index].busStation.stationName}
				>
					{#each itineraryDetails.paths as stationPath (stationPath.itineraryPathId)}
						<option value={stationPath.busStation.stationName}
							>{stationPath.busStation.stationName}</option
						>
					{/each}
				</select>
			</div>
		{/each}
	</div>
	<div class="d-flex flex-column">
		<!-- Rendering for the newly added path -->
		<div class="d-flex flex-row">
			<div>
				<!-- Display the departure time for the first station -->
				{#if itineraryDetails.paths[0].departureTime !== null}
					<input
						type="time"
						class="form-control"
						name="timeInput"
						value={`${String(itineraryDetails.paths[0].departureTime.hour).padStart(
							2,
							'0'
						)}:${String(itineraryDetails.paths[0].departureTime.minute).padStart(2, '0')}`}
					/>
				{:else}
					<input type="time" class="form-control invisible" name="timeInput" value="00:00" />
				{/if}
			</div>
			<div>
				<input type="time" class="form-control invisible" name="timeInput" value="00:00" />
			</div>
			<div>
				<input type="time" class="form-control invisible" name="timeInput" value="00:00" />
			</div>
		</div>
		<div class="d-flex flex-row">
			<div>
				<input type="time" class="form-control invisible" name="timeInput" value="00:00" />
			</div>
			<div>
				<!-- Display the arrival time for the last station -->
				{#if itineraryDetails.paths[itineraryDetails.paths.length - 1].arrivalTime !== null}
					<input
						type="time"
						class="form-control"
						name="timeInput"
						value={`${String(
							itineraryDetails.paths[itineraryDetails.paths.length - 1].arrivalTime.hour
						).padStart(2, '0')}:${String(
							itineraryDetails.paths[itineraryDetails.paths.length - 1].arrivalTime.minute
						).padStart(2, '0')}`}
					/>
				{:else}
					<input type="time" class="form-control invisible" name="timeInput" value="00:00" />
				{/if}
			</div>
			<div>
				<input type="time" class="form-control invisible" name="timeInput" value="00:00" />
			</div>
		</div>
	</div>
</div>
