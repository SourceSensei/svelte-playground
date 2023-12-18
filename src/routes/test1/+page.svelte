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

	const addEmptySelect = () => {
		// Get the existing row container
		const emptyDivContainer = document.getElementById('empty-div-container');

		// Create a new div for the empty select and time inputs
		const newDiv = document.createElement('div');
		newDiv.className = 'd-flex flex-row justify-content-center mb-2 mt-2'; // Ensure it's a row

		// Create an empty select element
		const emptySelect = document.createElement('select');
		emptySelect.className = 'form-control';
		emptySelect.onchange = (event) => handleStopSelection(event, emptyDivContainer.children.length);

		// Populate select options with station names
		itineraryDetails.paths.forEach((path) => {
			const option = document.createElement('option');
			option.value = path.busStation.stationName;
			option.textContent = path.busStation.stationName;
			option.addEventListener('click', (event) => handleOptionClick(event, path));

			emptySelect.appendChild(option);
		});

		newDiv.appendChild(emptySelect);

		// Create three empty time inputs
		for (let i = 0; i < 3; i++) {
			const timeInput = document.createElement('input');
			timeInput.type = 'time';
			timeInput.className = 'form-control';
			newDiv.appendChild(timeInput);
		}

		// Create a delete button
		const deleteButton = document.createElement('button');
		deleteButton.title = 'Remover';
		deleteButton.className = 'btn btn-sm btn-danger shadow-sm';
		deleteButton.innerHTML = '<i class="fas fa-trash fa-sm"></i>';
		deleteButton.addEventListener('click', () => handleRemoveStop(deleteButton));
		newDiv.appendChild(deleteButton);

		// Append the new div to the empty-div-container
		emptyDivContainer.appendChild(newDiv);
	};

	const handleOptionClick = (event, path) => {
		// Access the selected option's value
		const selectedStationName = event.target.value;

		// Do something with the selected station name or path
		console.log(`Selected station: ${selectedStationName}`);
		console.log('Path details:', path);
	};

	const handleStopSelection = async (event, index) => {
		const selectedStopName = event.target.value;
		const selectedStop = itineraryDetails.paths.find(
			(path) => path.busStation.stationName === selectedStopName
		);

		if (selectedStop) {
			const firstStationCode = itineraryDetails.departureStation.stationCode;
			const selectedStationCode = selectedStop.busStation.stationCode;

			// Fetch total time between stations
			await stopDetailsFetch(firstStationCode, selectedStationCode);

			// Calculate total time and update arrival time for the last station
			const totalTimeMinutes =
				betweenStopsDetails.totalTime.hour * 60 + betweenStopsDetails.totalTime.minute;
			const lastStationIndex = itineraryDetails.paths.length - 1;

			// Update arrival time for the last station
			itineraryDetails.paths[lastStationIndex].arrivalTime = addTime(
				itineraryDetails.paths[0].departureTime,
				totalTimeMinutes
			);

			// Update total time for the last station
			itineraryDetails.paths[lastStationIndex].waitingTime = betweenStopsDetails.totalTime;

			// Update departure time for subsequent stations
			for (let i = lastStationIndex; i < itineraryDetails.paths.length - 1; i++) {
				itineraryDetails.paths[i + 1].departureTime = addTime(
					itineraryDetails.paths[i].arrivalTime,
					totalTimeMinutes
				);
			}

			// Trigger update
			itineraryDetailsStore.set(itineraryDetails);
		}
	};

	const handleRemoveStop = (deleteButton) => {
		// Find the index of the button's parent div within the container
		const emptyDivContainer = document.getElementById('empty-div-container');
		const index = Array.from(emptyDivContainer.children).indexOf(deleteButton.parentNode);

		if (index !== -1) {
			// Remove the corresponding div element from the DOM
			emptyDivContainer.children[index].remove();
		} else {
			console.warn('Unable to determine index for the clicked button.');
		}
	};

	// const removeStop = (itineraryPathId) => {
	// 	itineraryDetailsStore.update((storeValue) => ({
	// 		...storeValue,
	// 		paths: storeValue.paths.filter((path) => path.itineraryPathId !== itineraryPathId)
	// 	}));
	// };

	// const handleRemoveStop = (itineraryPathId) => {
	// 	removeStop(itineraryPathId);

	// };

	// Refactored handleUpdateTime and handleUpdate functions
	const handleUpdateTime = (event, itineraryPathId, timeType) => {
		const { value } = event.target;
		const path = $itineraryDetailsStore.paths.find(
			(path) => path.itineraryPathId === itineraryPathId
		);

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

			handleUpdate(itineraryPathId, path);
		}
	};

	const handleUpdate = (itineraryPathId, updatedPath) => {
		const index = itineraryDetails.paths.findIndex(
			(path) => path.itineraryPathId === itineraryPathId
		);

		if (index !== -1) {
			const timeValue = `${String(updatedPath.waitingTime.hour).padStart(2, '0')}:${String(
				updatedPath.waitingTime.minute
			).padStart(2, '0')}`;

			const waitingTimeMinutes = updatedPath.waitingTime.hour * 60 + updatedPath.waitingTime.minute;

			itineraryDetails.paths[index].departureTime = addTime(
				itineraryDetails.paths[index].departureTime,
				waitingTimeMinutes
			);

			for (let i = index + 1; i < itineraryDetails.paths.length; i++) {
				if (itineraryDetails.paths[i].departureTime) {
					itineraryDetails.paths[i].departureTime = addTime(
						itineraryDetails.paths[i].departureTime,
						waitingTimeMinutes
					);
				} else {
					console.warn(
						'Departure Time is null for path:',
						itineraryDetails.paths[i].itineraryPathId
					);
				}
			}

			for (let i = index; i < itineraryDetails.paths.length - 1; i++) {
				if (itineraryDetails.paths[i].arrivalTime) {
					itineraryDetails.paths[i + 1].arrivalTime = addTime(
						itineraryDetails.paths[i + 1].arrivalTime,
						waitingTimeMinutes
					);
				} else {
					console.warn('Arrival Time is null for path:', itineraryDetails.paths[i].itineraryPathId);
				}
			}
		} else {
			console.warn('Departure Time is undefined for path:', itineraryPathId);
		}
	};

	const addTime = (baseTime, addedMinutes) => {
		const baseTimeMinutes = baseTime.hour * 60 + baseTime.minute;
		const newTimeMinutes = baseTimeMinutes + addedMinutes;

		return {
			hour: Math.floor(newTimeMinutes / 60),
			minute: newTimeMinutes % 60
		};
	};

	onMount(async () => {
		try {
			updating = true;

			await fetchItineraryDetails();
			await stopDetailsFetch(402, 1);
		} catch (error) {
			console.error('Error fetching itinerary details:', error);
		} finally {
			updating = false;
		}
	});
</script>

<div class="d-flex align-items-center justify-content-between mb-4">
	<h1 class="h3 mb-0 text-gray-800">Editar Circulação</h1>
</div>

<div>
	<div class="d-flex flex-column">
		<div class="d-flex flex-row justify-content-start mb-4">
			<div class="mr-3">
				<h5>Paragens</h5>
			</div>
			<div>
				<button class="btn btn-sm btn-primary" on:click={addEmptySelect}>+ Adicionar</button>
			</div>
		</div>
		<div class="d-flex flex-row justify-content-center">
			<div class="w-100">
				<select class="form-control" disabled>
					<option value={itineraryDetails.departureStation.stationName}>
						{itineraryDetails.departureStation.stationName}
					</option>
				</select>
			</div>
			<div>
				{#if itineraryDetails.paths[0].departureTime !== null}
					<input
						type="time"
						class="form-control"
						name="timeInputDeparture"
						value={`${String(itineraryDetails.paths[0].departureTime.hour || 0).padStart(
							2,
							'0'
						)}:${String(itineraryDetails.paths[0].departureTime.minute || 0).padStart(2, '0')}`}
						on:change={(event) =>
							handleUpdateTime(event, itineraryDetails.paths[0].itineraryPathId, 'departure')}
					/>
				{/if}
			</div>
			<div><input type="time" class="form-control invisible" /></div>
			<div><input type="time" class="form-control invisible" /></div>
			<div class="mt-1">
				<button
					title="Remover"
					on:click={addEmptySelect}
					class="btn btn-sm btn-danger shadow-sm invisible"
				>
					<i class="fas fa-trash fa-sm" />
				</button>
			</div>
		</div>
		<div id="empty-div-container" class="d-flex flex-column">
			<div id="empty-select-container"></div>
			<div id="empty-departureTime-container"></div>
			<div id="empty-arrivalTime-container"></div>
			<div id="empty-waitingTime-container"></div>
			<div id="delete-trash-container"></div>
		</div>
		<div class="d-flex flex-row justify-content-center">
			<div class="w-100">
				<select class="form-control" disabled>
					<option value={itineraryDetails.arrivalStation.stationName}>
						{itineraryDetails.arrivalStation.stationName}
					</option>
				</select>
			</div>

			<div><input type="time" class="form-control invisible" /></div>
			<div>
				{#if itineraryDetails.paths[itineraryDetails.paths.length - 1].arrivalTime !== null}
					<input
						type="time"
						class="form-control"
						name="timeInputArrival"
						value={`${String(
							itineraryDetails.paths[itineraryDetails.paths.length - 1].arrivalTime.hour || 0
						).padStart(2, '0')}:${String(
							itineraryDetails.paths[itineraryDetails.paths.length - 1].arrivalTime.minute || 0
						).padStart(2, '0')}`}
						on:change={(event) =>
							handleUpdateTime(
								event,
								itineraryDetails.paths[itineraryDetails.paths.length - 1].itineraryPathId,
								'arrival'
							)}
					/>
				{/if}
			</div>

			<div><input type="time" class="form-control invisible" /></div>
			<div class="mt-1">
				<button
					title="Remover"
					on:click={addEmptySelect}
					class="btn btn-sm btn-danger shadow-sm invisible"
				>
					<i class="fas fa-trash fa-sm" />
				</button>
			</div>
		</div>
	</div>
</div>
