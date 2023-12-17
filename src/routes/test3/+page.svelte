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

	// const addEmptySelect = () => {
	// 	console.log('Adding empty select...');

	// 	const newEmptyPath = {
	// 		itineraryPathId: generateUniqueId(),
	// 		routeCode: null,
	// 		busStation: {
	// 			stationCode: null,
	// 			stationName: ''
	// 		},
	// 		departureTime: { hour: 0, minute: 0 },
	// 		arrivalTime: { hour: 0, minute: 0 },
	// 		waitingTime: { hour: 0, minute: 0 }
	// 	};

	// 	itineraryDetailsStore.update((storeValue) => {
	// 		return {
	// 			...storeValue,
	// 			paths: [...storeValue.paths, newEmptyPath]
	// 		};
	// 	});
	// };

	const addEmptySelect = (index) => {
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
			const updatedPaths = [...storeValue.paths];
			updatedPaths.splice(index, 0, newEmptyPath);

			return {
				...storeValue,
				paths: updatedPaths
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

<!-- <div class="mt-5">
	<div class="d-flex flex-row">
		<div class="d-flex flex-column">
			<div class="d-inline-flex">
				<div>
					<h4>Paragens</h4>
				</div>
				<div>
					<button>+ Adicionar</button>
				</div>
			</div>
			<div>
				<select class="form-control" disabled>
					<option value={itineraryDetails.departureStation.stationName}>
						{itineraryDetails.departureStation.stationName}
					</option>
				</select>
			</div>
			<div>
				<select name="" id="" class="form-control">
					<option value="">empty</option>
				</select>
			</div>
			<div>
				<select class="form-control" disabled>
					<option value={itineraryDetails.arrivalStation.stationName}>
						{itineraryDetails.arrivalStation.stationName}
					</option>
				</select>
			</div>
		</div>
		<div class="d-flex flex-column">
			<div><h5>Partidas</h5></div>
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
			<div>
				<input type="time" class="form-control" />
			</div>
			<div>
				<input type="time" class="form-control" />
			</div>
		</div>
		<div class="d-flex flex-column">
			<div><h5>Chegadas</h5></div>
			<div>
				<input type="time" class="form-control" />
			</div>
			<div>
				<input type="time" class="form-control" />
			</div>
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
		</div>
		<div class="d-flex flex-column">
			<div><h5>Espera</h5></div>
			<div class="d-inline-flex">
				<div>
					<input type="time" class="form-control" />
				</div>
				<div>
					<button>Eliminar</button>
				</div>
			</div>

			<div class="d-inline-flex">
				<div>
					<input type="time" class="form-control" />
				</div>
				<div>
					<button>Eliminar</button>
				</div>
			</div>
			<div class="d-inline-flex">
				<div>
					<input type="time" class="form-control" />
				</div>
				<div>
					<button>Eliminar</button>
				</div>
			</div>
		</div>
	</div>
</div> -->

<div class="mt-5">
	<div class="d-flex flex-row">
		<div class="d-flex flex-column">
			<div class="d-inline-flex">
				<div>
					<h4>Paragens</h4>
				</div>
				<div>
					<button on:click={() => addEmptySelect()}>+ Adicionar</button>
				</div>
			</div>
			<div>
				<select class="form-control" disabled>
					<option value={itineraryDetails.departureStation.stationName}>
						{itineraryDetails.departureStation.stationName}
					</option>
				</select>
			</div>
			{#each itineraryDetails.paths as path (path.itineraryPathId)}
				<div class="d-flex flex-row align-items-center" key={path.itineraryPathId}>
					<div>
						<select
							id={`stationInput_${path.itineraryPathId}`}
							name={`stationInput_${path.itineraryPathId}`}
							class="form-control"
							value={path.busStation.stationName}
						>
							{#each itineraryDetails.paths as stationPath (stationPath.itineraryPathId)}
								<option value={stationPath.busStation.stationName}>
									{stationPath.busStation.stationName}
								</option>
							{/each}
						</select>
					</div>
					<div>
						<input
							type="time"
							class="form-control"
							name={`timeInputDeparture_${path.itineraryPathId}`}
							value={`${String(path.departureTime?.hour || 0).padStart(2, '0')}:${String(
								path.departureTime?.minute || 0
							).padStart(2, '0')}`}
							on:change={(event) => handleUpdateTime(event, path.itineraryPathId, 'departure')}
						/>
					</div>
					<div>
						<input type="time" class="form-control" />
					</div>
					<div>
						<input type="time" class="form-control" />
					</div>
					<div>
						<button
							title="Remover"
							on:click|preventDefault={() => handleRemoveStop(path.itineraryPathId)}
							class="btn btn-sm btn-danger shadow-sm"
						>
							<i class="fas fa-trash fa-sm" />
						</button>
					</div>
				</div>
			{/each}
			<div>
				<select class="form-control" disabled>
					<option value={itineraryDetails.arrivalStation.stationName}>
						{itineraryDetails.arrivalStation.stationName}
					</option>
				</select>
			</div>
		</div>
	</div>
</div>
