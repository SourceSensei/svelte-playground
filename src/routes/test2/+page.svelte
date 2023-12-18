<script>
	import { onMount } from 'svelte';

	let updating = false;
	let loading = updating;

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

	let betweenStopsDetails = {
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
	};

	const fetchItineraryDetails = async () => {
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

			betweenStopsDetails = data;
		} catch (error) {
			console.error(error);
		}
	};

	let newDiv;

	const addEmptySelect = () => {
		const emptyDivContainer = document.getElementById('empty-div-container');
		newDiv = document.createElement('div');
		newDiv.className = 'd-flex flex-row justify-content-center mb-2 mt-2'; // Ensure it's a row

		const emptySelect = document.createElement('select');
		emptySelect.className = 'form-control';
		emptySelect.addEventListener('change', (event) => handleStationSelection(event));

		// Populate select options with station names
		itineraryDetails.paths.forEach((path) => {
			const option = document.createElement('option');
			option.value = path.busStation.stationName;
			option.textContent = path.busStation.stationName;

			emptySelect.appendChild(option);
		});

		newDiv.appendChild(emptySelect);

		// Create three empty time inputs
		const departureTimeInput = document.createElement('input');
		departureTimeInput.type = 'time';
		departureTimeInput.className = 'form-control';
		newDiv.appendChild(departureTimeInput);

		// Create the arrival time input
		const arrivalTimeInput = document.createElement('input');
		arrivalTimeInput.type = 'time';
		arrivalTimeInput.className = 'form-control';
		newDiv.appendChild(arrivalTimeInput);

		// Create the waiting time input
		const waitingTimeInput = document.createElement('input');
		waitingTimeInput.type = 'time';
		waitingTimeInput.className = 'form-control';
		newDiv.appendChild(waitingTimeInput);

		// Create a delete button
		const deleteButton = document.createElement('button');
		deleteButton.title = 'Remover';
		deleteButton.className = 'btn btn-sm btn-danger shadow-sm';
		deleteButton.innerHTML = '<i class="fas fa-trash fa-sm"></i>';
		deleteButton.addEventListener('click', () => handleRemoveStop(deleteButton));
		newDiv.appendChild(deleteButton);

		emptyDivContainer.appendChild(newDiv);
	};

	const handleStationSelection = async (event) => {
		const selectedIndex = event.target.selectedIndex;
		const selectedOption = event.target.options[selectedIndex];
		const selectedStationName = selectedOption.value;
		const selectedStationCode = itineraryDetails.paths[selectedIndex].busStation.stationCode;

		console.log('Selected Station Code:', selectedStationCode);
		// Call stopDetailsFetch(selectedStationCode) here or perform other actions

		await stopDetailsFetch(itineraryDetails.departureStation.stationCode, selectedStationCode);

		// Calculate and update arrival time
		updateArrivalTimeInput(selectedStationCode);
	};

	let arrivalTimeInput;

	const updateArrivalTimeInput = (selectedStationCode) => {
		// Ensure a selected station is available
		if (!selectedStationCode) return;

		// Calculate total time from the first station to the selected station
		const totalTime = betweenStopsDetails.totalTime;

		// Calculate arrival time
		const arrivalTime = sumOfStations(itineraryDetails.paths[0].departureTime, totalTime);

		// Get the container to add the arrival time input
		const arrivalTimeContainer = document.getElementById('empty-arrivalTime-container');

		// Remove existing arrival time input if any
		arrivalTimeContainer.innerHTML = '';

		// Create and append the arrival time input
		const arrivalTimeInput = document.createElement('input');
		arrivalTimeInput.type = 'time';
		arrivalTimeInput.className = 'form-control';
		arrivalTimeInput.value = `${String(arrivalTime.hour).padStart(2, '0')}:${String(
			arrivalTime.minute
		).padStart(2, '0')}`;
		arrivalTimeInput.onchange = (event) =>
			handleUpdateTime(event, itineraryDetails.paths[0].itineraryPathId, 'arrival');

		// Get the container to add the arrival time input
		const emptyDivContainer = document.getElementById('empty-div-container');

		// Get the newDiv from the last element in the container
		const newDiv = emptyDivContainer.lastElementChild;

		// Get the second child of newDiv
		const secondChild = newDiv.children[1]; // Index 1 corresponds to the second child (time input)

		// Insert the arrivalTimeInput after the second child
		newDiv.insertBefore(arrivalTimeInput, secondChild.nextSibling);
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

	// Refactored handleUpdateTime and handleUpdate functions
	const handleUpdateTime = (event, itineraryPathId, timeType) => {
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

	let arrivalTime = null;

	$: {
		const lastPath = itineraryDetails.paths[itineraryDetails.paths.length - 1];
		arrivalTime =
			lastPath.arrivalTime !== null
				? sumOfStations(itineraryDetails.paths[0].departureTime, betweenStopsDetails.totalTime)
				: null;
	}

	const sumOfStations = (departureTime, totalTime) => {
		const totalMinutes =
			departureTime.hour * 60 + departureTime.minute + totalTime.hour * 60 + totalTime.minute;

		return {
			hour: Math.floor(totalMinutes / 60),
			minute: totalMinutes % 60
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
					<option value={betweenStopsDetails.from.stationName}>
						{betweenStopsDetails.from.stationName}
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
						value={`${arrivalTime !== null ? String(arrivalTime.hour).padStart(2, '0') : '00'}:${
							arrivalTime !== null ? String(arrivalTime.minute).padStart(2, '0') : '00'
						}`}
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
