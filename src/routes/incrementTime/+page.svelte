<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let updating = false;
	$: loading = updating;

	// LOGIC TO BE IMPLEMENTED
	// const initialDepartureTime = { hour: 9, minute: 0 };
	// let totalTime = { hour: 2, minute: 40 };

	// const timeFromAbrantesToTramagal = { hour: 0, minute: 14 };
	// totalTime = {
	// 	hour: totalTime.hour,
	// 	minute: totalTime.minute - timeFromAbrantesToTramagal.minute
	// };

	// const timeFromTramagalToChamusca = { hour: 0, minute: 26 };
	// totalTime = {
	// 	hour: totalTime.hour,
	// 	minute: totalTime.minute - timeFromTramagalToChamusca.minute
	// };

	// const arrivalTime = {
	// 	hour: initialDepartureTime.hour + totalTime.hour,
	// 	minute: initialDepartureTime.minute + totalTime.minute
	// };

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

	let betweenStopsDetails = [];

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

	const addEmptySelect = () => {
		console.log('Adding empty select...');

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
			return {
				...storeValue,
				paths: [...storeValue.paths, newEmptyPath]
			};
		});
	};

	const generateUniqueId = () => {
		return '_' + Math.random().toString(36).substr(2, 9);
	};

	// Remove the stop from the paths array
	const removeStop = (itineraryPathId) => {
		itineraryDetailsStore.update((storeValue) => ({
			...storeValue,
			paths: storeValue.paths.filter((path) => path.itineraryPathId !== itineraryPathId)
		}));
	};

	const handleRemoveStop = (itineraryPathId) => {
		removeStop(itineraryPathId);
		// Later save function here
	};

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
			await fetchItineraryDetails();
			await stopDetailsFetch(402, 1);

			updating = true;
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

<div class=" mb-4">
	<div class="card-body">
		<div class="">
			<div class="d-flex flex-row justify-content-start mb-5">
				<div class="d-flex flex-column mr-3">
					<div class="d-inline-flex mb-3">
						<h4 class="mr-3 text-dark">Paragens</h4>
						<button class="btn btn-sm btn-primary shadow-sm" on:click={addEmptySelect}
							><i class="fa-solid fa-plus"></i>&nbsp;Adicionar</button
						>
					</div>
					<div>
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
				</div>
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
									on:change={(event) => handleUpdateTime(event, path.itineraryPathId, 'departure')}
								/>
							{:else}
								<div class="">
									<input type="time" class="form-control invisible" name="timeInput" />
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
									on:change={(event) => handleUpdateTime(event, path.itineraryPathId, 'arrival')}
								/>
							{:else}
								<div class="">
									<input type="time" class="form-control invisible" name="timeInput" />
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
						<div class="mb-2 d-inline-flex">
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
								<div class="ml-3 mt-1">
									<button
										title="Remover"
										on:click|preventDefault={() => handleRemoveStop(path.itineraryPathId)}
										class="btn btn-sm btn-danger shadow-sm"
									>
										<i class="fas fa-trash fa-sm" />
									</button>
								</div>
							{:else}
								<div class="">
									<input type="time" class="form-control invisible" name="timeInput" />
								</div>
								<div class="ml-3 mt-1">
									<button
										title="Remover"
										on:click|preventDefault={() => handleRemoveStop(path.itineraryPathId)}
										class="btn btn-sm btn-danger shadow-sm"
									>
										<i class="fas fa-trash fa-sm" />
									</button>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
			<!-- add here -->
		</div>
	</div>
</div>
