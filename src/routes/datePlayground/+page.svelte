<script>
	import { onMount } from 'svelte';

	let itineraryDetails = {
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
	};

	let fetchStops = async () => {
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

			itineraryDetails = data;
		} catch (error) {
			console.error(error);
		}
	};

	function handleUpdateTime(event, itineraryPathId, timeType) {
		const { value } = event.target;

		const path = itineraryDetails.paths.find((path) => path.itineraryPathId === itineraryPathId);
		if (path && path.departureTime) {
			const [hours, minutes] = value.split(':').map(Number);

			switch (timeType) {
				case 'departure':
					path.departureTime = { hour: hours, minute: minutes };
					break;
				case 'arrival':
					path.arrivalTime = { hour: hours, minute: minutes };
					break;
				case 'waiting':
					path.waitingTime = { hour: hours, minute: minutes };
					break;
				default:
					break;
			}

			// Log the current value
			console.log(`${timeType} Time Value:`, path[timeType + 'Time']);

			// Call a common function to handle the rest of the calculations and UI updates
			handleUpdate(itineraryPathId, path);
		}
	}

	function handleUpdate(itineraryPathId, updatedPath) {
		const index = itineraryDetails.paths.findIndex(
			(path) => path.itineraryPathId === itineraryPathId
		);
		if (index !== -1) {
			const timeValue = `${String(updatedPath.waitingTime.hour).padStart(2, '0')}:${String(
				updatedPath.waitingTime.minute
			).padStart(2, '0')}`;
			console.log(`Waiting Time Value:`, timeValue);

			// Update the departure time based on waiting time
			const departureTimeMinutes =
				updatedPath.departureTime.hour * 60 + updatedPath.departureTime.minute;
			const waitingTimeMinutes = updatedPath.waitingTime.hour * 60 + updatedPath.waitingTime.minute;
			const newDepartureTimeMinutes = departureTimeMinutes + waitingTimeMinutes;

			const newDepartureTime = {
				hour: Math.floor(newDepartureTimeMinutes / 60),
				minute: newDepartureTimeMinutes % 60
			};

			// Update the departure time directly
			itineraryDetails.paths[index].departureTime = newDepartureTime;

			// Log the updated departure time
			console.log('Updated Departure Time:', itineraryDetails.paths[index].departureTime);

			// Additional logic or calculations based on the time type can be added here

			// Update the UI with the new time value
			// Handle departure time UI update if needed
			// Handle arrival time UI update if needed
			// Handle waiting time UI update if needed
		} else {
			console.warn('Departure Time is undefined for path:', itineraryPathId);
		}
	}

	onMount(() => {
		fetchStops();
	});
</script>

<div class="d-flex flex-column justify-content-center text-center align-items-center">
	<div class="mr-3 mb-4">
		<h1>Date/Time Playground</h1>
	</div>

	<div class="d-flex flex-row">
		<div class="d-flex flex-column mr-3">
			<div class="mb-3">
				<h4 class="mr-3 text-dark">Partida</h4>
			</div>
			{#each itineraryDetails.paths as path (path.itineraryPathId)}
				<div class="mb-2">
					{#if path.departureTime !== null}
						<input
							type="time"
							class="form-control"
							id={`timeInputDeparture_${path.itineraryPathId}`}
							name={`timeInputDeparture_${path.itineraryPathId}`}
							value={`${String(path.departureTime.hour).padStart(2, '0')}:${String(
								path.departureTime.minute
							).padStart(2, '0')}`}
							disabled={true}
							on:change={(event) => handleUpdateTime(event, path.itineraryPathId, 'departure')}
						/>
					{:else}
						<div class="">
							<input type="time" class="form-control invisible" name="timeInput" disabled={true} />
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<div class="d-flex flex-column mr-3">
			<div class="mb-3">
				<h4 class="mr-3 text-dark">Chegada</h4>
			</div>
			{#each itineraryDetails.paths as path (path.itineraryPathId)}
				<div class="mb-2">
					{#if path.arrivalTime !== null}
						<input
							type="time"
							class="form-control"
							id={`timeInputArrival_${path.itineraryPathId}`}
							name={`timeInputArrival_${path.itineraryPathId}`}
							value={`${String(path.arrivalTime.hour).padStart(2, '0')}:${String(
								path.arrivalTime.minute
							).padStart(2, '0')}`}
							disabled={true}
							on:change={(event) => handleUpdateTime(event, path.itineraryPathId, 'arrival')}
						/>
					{:else}
						<div class="">
							<input type="time" class="form-control invisible" name="timeInput" disabled={true} />
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<div class="d-flex flex-column mr-3">
			<div class="mb-3">
				<h4 class="mr-3 text-dark">Espera</h4>
			</div>
			{#each itineraryDetails.paths as path (path.itineraryPathId)}
				<div class="mb-2">
					{#if path.waitingTime !== null}
						<input
							type="time"
							class="form-control"
							id={`timeInputWaiting_${path.itineraryPathId}`}
							name={`timeInputWaiting_${path.itineraryPathId}`}
							value={`${String(path.waitingTime.hour).padStart(2, '0')}:${String(
								path.waitingTime.minute
							).padStart(2, '0')}`}
							on:input={(event) => handleUpdateTime(event, path.itineraryPathId, 'waiting')}
						/>
					{:else}
						<div class="">
							<input type="time" class="form-control invisible" name="timeInput" disabled={true} />
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
