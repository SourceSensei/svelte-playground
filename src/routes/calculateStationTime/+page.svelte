<script>
	import { onMount } from 'svelte';
	// import router from 'page';
	// import * as api from '../../../api';
	// import Overlay from '../../../components/controls/Overlay.svelte';

	// export let params;

	let updating = false;
	let loading = updating;

	let activeDeparture = false;
	let activeArrival = false;

	let middleStationAdded = false;
	let stationSelected = false;

	let warning = false;

	let distances = {};
	let relevantStationsFromDeparture = [];
	let relevantStationsFromMiddle = [];
	let relevantStationsFromEnd = [];
	let allSelectedStations = [];

	// informações sobre o itinerário
	// paragens no itinerário, caminhos, frequência, regras para feriados, datas de início e fim, número do bus, empresa, outros...
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

	// Este object é usado para armazenar informações detalhadas sobre cada estação no itinerário
	let stationIndividualDetails = {};
	// 1 : {stationName: 'Lisboa (Sete Rios)', position: 8, departure: null, arrival: {…}, waiting: null}

	// informações sobre as distâncias e tempos entre duas paragens
	let betweenTwoStopsDetails = {
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

	//UTILS
	// $: goBackPath =
	// 	params && params.routeCode && params.variantCode
	// 		? `/simbus/routes/${params.routeCode}`
	// 		: '/simbus/itineraries';

	// $: if (goBackPath) console.log(goBackPath);

	// const save = async () => {
	// 	if (updating) return;
	// 	updating = true;

	// 	try {
	// 	} catch (error) {
	// 		console.error('Error updating itinerary:', error);
	// 	} finally {
	// 		updating = false;
	// 	}
	// };

	function generateUniqueId(prefix = 'id') {
		return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
	}

	const findDistanceInfo = (stationCode1, stationCode2) => {
		const key = `${stationCode1}-${stationCode2}`;
		const reversedKey = `${stationCode2}-${stationCode1}`;

		if (distances[key]) {
			const { stationName1, stationName2, totalTime } = distances[key];
			return { stationName1, stationName2, totalTime };
		} else if (distances[reversedKey]) {
			const { stationName1, stationName2, totalTime } = distances[reversedKey];
			return { stationName1, stationName2, totalTime };
		}

		return null;
	};

	// Função para obter as estações para a estação selecionada
	const getStationsWithinDistance = (stationCode) => {
		const stationsWithinDistance = [];

		for (const key in distances) {
			const info = distances[key];

			// Verifique se a estação inicial (stationCode) está envolvida nas distâncias disponíveis
			if (
				info.stationName1 === stationIndividualDetails[stationCode]?.stationName ||
				info.stationName2 === stationIndividualDetails[stationCode]?.stationName
			) {
				// Adicione a estação alvo (outra estação além da estação inicial) ao array de estações dentro da distância
				const targetStation =
					info.stationName1 === stationIndividualDetails[stationCode]?.stationName
						? info.stationName2
						: info.stationName1;
				stationsWithinDistance.push(targetStation);
			}
		}

		return stationsWithinDistance;
	};

	const calculateTimeForStationDistance = (departureTime, totalTime) => {
		if (departureTime && departureTime.hour !== undefined && totalTime) {
			let finalHour = departureTime.hour + totalTime.hour;
			let finalMinute = departureTime.minute + totalTime.minute;

			// Normalize the time to ensure it's within the appropriate limits
			while (finalMinute >= 60) {
				finalHour++;
				finalMinute -= 60;
			}

			while (finalHour >= 24) {
				finalHour -= 24;
			}

			return {
				hour: finalHour,
				minute: finalMinute
			};
		} else {
			console.error('Invalid departureTime or totalTime:', departureTime, totalTime);
			return null;
		}
	};

	let beginDateStr = '2023-12-10T13:05:49.043Z';
	let endDateStr = '2023-12-10T13:05:49.043Z';

	// Extracting year, month, and day into a function
	const formatDate = (dateString) => {
		const dateObject = new Date(dateString);
		const year = dateObject.getFullYear();
		const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
		const day = dateObject.getDate().toString().padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	$: beginFormattedDate = formatDate(beginDateStr);
	$: endFormattedDate = formatDate(endDateStr);

	// TIME FORMAT
	const formatTime = (timeObj) => {
		if (timeObj && timeObj.hour !== undefined && timeObj.minute !== undefined) {
			const { hour, minute } = timeObj;
			return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
		} else {
			return '00:00';
		}
	};

	// DEPARTURE STATION
	let departureStationSelection = {
		code: null,
		name: null,
		departureTime: {
			hour: 0,
			minute: 0
		}
	};

	let departureStationButton;

	const updateFirstStationInfo = (stationCode, stationName, departureTime) => {
		if (stationCode && stationName && departureTime) {
			departureStationSelection.code = stationCode;
			departureStationSelection.name = stationName;
			departureStationSelection.departureTime = {
				hour: departureTime.hour || 0,
				minute: departureTime.minute || 0
			};

			activeDeparture = true;

			if (activeDeparture) {
				document.getElementById('departureButton').disabled = true;
			}

			const departureTimeInput = document.getElementById(
				`departureTimeInput-${itineraryDetails.itineraryPathId}`
			);

			if (departureTimeInput && departureStationSelection.departureTime !== null) {
				const formattedHour = departureStationSelection.departureTime.hour
					.toString()
					.padStart(2, '0');
				const formattedMinute = departureStationSelection.departureTime.minute
					.toString()
					.padStart(2, '0');
				departureTimeInput.value = `${formattedHour}:${formattedMinute}`;
				departureTimeInput.disabled = true;
			} else {
				departureTimeInput.value = '00:00';
			}

			if (departureStationButton) {
				departureStationButton.textContent = departureStationSelection.name || 'Partida';
			}

			allSelectedStations.push({
				type: 'departure',
				code: departureStationSelection.code,
				name: departureStationSelection.name,
				time: {
					hour: departureStationSelection.departureTime.hour,
					minute: departureStationSelection.departureTime.minute
				}
			});

			console.log('Departure Selected:', allSelectedStations);
		}

		const relevantStationsForDepartureStation = getStationsWithinDistance(stationCode);

		relevantStationsFromDeparture = relevantStationsForDepartureStation;

		console.log('Stations from Departure:', relevantStationsFromDeparture);
	};

	const handleButtonClickForFirstStation = (stationCode) => {
		const station = itineraryDetails.paths.find(
			(path) => path.busStation.stationCode === stationCode
		);

		if (station) {
			updateFirstStationInfo(
				station.busStation.stationCode,
				station.busStation.stationName,
				station.departureTime
			);
		}
	};

	// MIDDLE STATIONS
	let middleStationSelection = {
		code: null,
		name: '',
		totalTime: {
			hour: 0,
			minute: 0
		}
	};

	let middleStationdropdownButton;
	let firstMiddleStationCode = null;

	const updateMiddleStationInfo = (stationCode, stationName) => {
		const lastSelectedStation = allSelectedStations[allSelectedStations.length - 1];
		const lastMiddleStationCode = lastSelectedStation ? lastSelectedStation.code : null;

		firstMiddleStationCode = lastSelectedStation.code;

		let firstStationCode = firstMiddleStationCode;
		const middleStationCode = stationCode;

		try {
			const pathInfo = findDistanceInfo(firstStationCode, middleStationCode);

			if (pathInfo) {
				const { stationName1, stationName2, totalTime } = pathInfo;

				let finalTime;

				if (allSelectedStations.length === 0) {
					middleStationSelection = {
						code: stationCode,
						name: stationName,
						totalTime: {
							hour: totalTime.hour,
							minute: totalTime.minute
						}
					};

					finalTime = calculateTimeForStationDistance(
						departureStationSelection.departureTime,
						totalTime
					);

					console.log('Total time starting from departure:', finalTime);
				} else {
					let lastSelectedStation = allSelectedStations[allSelectedStations.length - 1];
					let currentFinalTime = lastSelectedStation.currentFinalTime || { hour: 0, minute: 0 };

					if (lastSelectedStation.type !== 'middle') {
						currentFinalTime = departureStationSelection.departureTime || { hour: 0, minute: 0 };
					}

					finalTime = calculateTimeForStationDistance(currentFinalTime, totalTime);

					allSelectedStations.push({
						type: 'middle',
						code: stationCode,
						name: stationName,
						time: {
							hour: totalTime.hour,
							minute: totalTime.minute
						},
						currentFinalTime: finalTime
					});

					console.log('Total time so far for middle:', finalTime);
				}

				console.log('All Selected Stations:', allSelectedStations);

				stationSelected = true;

				const timeInput1 = document.getElementById(
					`timeInputforDeparture-${stationIndividualDetails[stationCode].pathId}`
				);

				if (timeInput1) {
					timeInput1.value = formatTime(finalTime);
				}

				const timeInput2 = document.getElementById(
					`timeInputforArrival-${stationIndividualDetails[stationCode].pathId}`
				);

				if (timeInput2) {
					timeInput2.value = formatTime(finalTime);
				}

				middleStationdropdownButton = document.getElementById(
					`middleStation-dropdownButton-${stationIndividualDetails[stationCode].pathId}`
				);
				if (middleStationdropdownButton) {
					middleStationdropdownButton.textContent = stationName;

					middleStationAdded = true;
				}

				const relevantStationsMiddle = getStationsWithinDistance(stationCode);

				relevantStationsFromMiddle = relevantStationsMiddle;

				if (relevantStationsFromMiddle.length > 0) {
					if (!relevantStationsFromMiddle.includes(arrivalStationSelection.name)) {
						let timeInput = document.getElementById('arrivalTimeLastStation');
						timeInput.value = '00:00';

						warning = true;
					} else {
						warning = false;
						let timeInput = document.getElementById('arrivalTimeLastStation');
						let lastValue = allSelectedStations[allSelectedStations.length - 1];

						const finalPathInfo = findDistanceInfo(lastValue.code, arrivalStationSelection.code);

						if (finalPathInfo) {
							const { stationName1, stationName2, totalTime } = finalPathInfo;
							lastValue.currentFinalTime = calculateTimeForStationDistance(
								lastValue.currentFinalTime,
								totalTime
							);
						}

						timeInput.value = formatTime(lastValue.currentFinalTime);
					}
				}

				// console.log('Relevant Stations from Middle:', relevantStationsFromMiddle)
			} else {
				console.error('Path information not found.');
			}
		} catch (error) {
			console.error('Error fetching path information:', error);
		}
	};

	let newDiv;
	let currentIndex = 0;

	const addEmptySelect = (index) => {
		const containerToBeFilled = document.getElementById('container-to-be-filled');

		newDiv = document.createElement('div');
		newDiv.className = 'input-group mt-3 mb-2';
		newDiv.id = `new-div-${generateUniqueId()}`;
		newDiv.dataset.index = index;
		index = currentIndex;

		console.log(currentIndex);

		function createDropdownItem(stationCode, stationName) {
			const dropdownItem = document.createElement('a');
			dropdownItem.className = 'dropdown-item';
			dropdownItem.href = '#';
			dropdownItem.textContent = stationName;
			dropdownItem.id = `middleStation-dropdownItem-${stationIndividualDetails[stationCode].pathId}`;

			dropdownItem.addEventListener('click', () => {
				const dropdownButton = newDiv.querySelector('.dropdown-toggle');

				dropdownButton.textContent = stationName;
				stationSelected = true;

				//console.log('Selected: ' + stationName + ' ' + stationCode)

				createInputs(stationCode);

				updateMiddleStationInfo(stationCode, stationName);
			});

			return dropdownItem;
		}

		function createInputs(stationCode) {
			const inputTimeContainer1 = document.createElement('div');
			const timeInput1 = createTimeInput('timeInputforDeparture', stationCode);
			inputTimeContainer1.className = 'ml-2';

			const inputTimeContainer2 = document.createElement('div');
			const timeInput2 = createTimeInput('timeInputforArrival', stationCode);
			inputTimeContainer2.className = 'ml-2';

			const inputTimeContainer3 = document.createElement('div');
			const timeInput3 = createTimeInput('timeInputforWaitingTime', stationCode);
			inputTimeContainer3.className = 'ml-2';

			const removeButtonContainer = document.createElement('div');
			const removeButton = document.createElement('button');
			removeButton.title = 'Remover';
			removeButton.className = 'btn btn-sm btn-danger shadow-sm ml-2 mt-1';
			removeButton.innerHTML = '<i class="fas fa-trash fa-sm"></i>';
			removeButton.addEventListener('click', () => handleRemoveStop(removeButton));

			inputTimeContainer1.appendChild(timeInput1);
			inputTimeContainer2.appendChild(timeInput2);
			inputTimeContainer3.appendChild(timeInput3);
			removeButtonContainer.appendChild(removeButton);

			// Append input containers to newDiv
			newDiv.appendChild(inputTimeContainer1);
			newDiv.appendChild(inputTimeContainer2);
			newDiv.appendChild(inputTimeContainer3);
			newDiv.appendChild(removeButtonContainer);
		}

		function createTimeInput(idSuffix, stationCode) {
			const timeInput = document.createElement('input');
			timeInput.type = 'time';
			timeInput.className = 'form-control';
			timeInput.style.width = '120px';
			timeInput.value = '00:00';
			timeInput.id = `${idSuffix}-${stationIndividualDetails[stationCode].pathId}`;
			return timeInput;
		}

		const dropdownButton = document.createElement('button');
		dropdownButton.type = 'button';
		dropdownButton.className = 'btn btn-primary text-white dropdown-toggle';
		dropdownButton.style.width = '120px';
		dropdownButton.dataset.toggle = 'dropdown';
		dropdownButton.id = `middleStation-dropdownButton-${generateUniqueId()}`;

		const selectedStation = dropdownButton.value || 'Selecione';
		dropdownButton.textContent = selectedStation;

		newDiv.appendChild(dropdownButton);

		const dropdownMenu = document.createElement('div');
		dropdownMenu.className = 'dropdown-menu';

		if (index === 0) {
			// Dropdown com distâncias a partir da primeira estação
			relevantStationsFromDeparture.forEach((stationName) => {
				const stationCode = Object.keys(stationIndividualDetails).find(
					(code) => stationIndividualDetails[code].stationName === stationName
				);

				if (!relevantStationsFromDeparture.includes(stationIndividualDetails[stationName])) {
					const dropdownItem = createDropdownItem(stationCode, stationName);
					dropdownMenu.appendChild(dropdownItem);
				}
			});
		} else if (index > 0) {
			dropdownMenu.innerHTML = '';

			relevantStationsFromMiddle.forEach((stationName) => {
				const stationCode = Object.keys(stationIndividualDetails).find(
					(code) => stationIndividualDetails[code].stationName === stationName
				);

				if (!relevantStationsFromMiddle.includes(stationIndividualDetails[stationName])) {
					const dropdownItem = createDropdownItem(stationCode, stationName);
					dropdownMenu.appendChild(dropdownItem);
				}
			});
		}

		newDiv.appendChild(dropdownMenu);

		containerToBeFilled.appendChild(newDiv);

		currentIndex++;
	};

	const handleRemoveStop = (removeButton) => {
		const containerToBeFilled = document.getElementById('container-to-be-filled');
		const parentDiv = removeButton.closest('.input-group');

		if (parentDiv) {
			parentDiv.remove();
			middleStationAdded = false;
			stationSelected = false;
		} else {
			console.warn('Unable to determine parent element for the clicked button.');
		}
	};

	const clearAllStations = () => {
		warning = false;

		departureStationSelection = {
			code: null,
			name: null,
			departureTime: {
				hour: 0,
				minute: 0
			}
		};

		activeDeparture = false;

		if (!activeDeparture) {
			document.getElementById('departureButton').disabled = false;
		}

		const departureTimeInput = document.getElementById(
			`departureTimeInput-${itineraryDetails.itineraryPathId}`
		);

		departureTimeInput.disabled = false;
		departureTimeInput.value = '00:00';

		middleStationSelection = {
			code: null,
			name: '',
			totalTime: {
				hour: 0,
				minute: 0
			}
		};

		newDiv.remove();

		middleStationAdded = false;

		stationSelected = false;

		arrivalStationSelection = {
			code: null,
			name: null,
			totalTime: {
				hour: 0,
				minute: 0
			}
		};

		activeArrival = false;

		if (!activeArrival) {
			document.getElementById('arrivalSelectedStationButton').disabled = false;
		}

		const arrivalTimeInput = document.getElementById('arrivalTimeLastStation');
		arrivalTimeInput.disabled = false;
		arrivalTimeInput.value = '00:00';
	};

	// LAST STATION
	let arrivalStationSelection = {
		code: null,
		name: null,
		totalTime: {
			hour: 0,
			minute: 0
		}
	};

	const updateLastArrivalStationInfo = async (stationCode, stationName) => {
		try {
			const departureStationCode = departureStationSelection.code;
			const pathInfo = findDistanceInfo(departureStationCode, stationCode);

			if (pathInfo) {
				const { stationName1, stationName2, totalTime } = pathInfo;

				arrivalStationSelection = {
					code: stationCode,
					name: stationName,
					totalTime: totalTime
				};

				activeArrival = true;

				if (activeArrival) {
					document.getElementById('arrivalSelectedStationButton').disabled = true;
				}

				let finalTime;

				finalTime = calculateTimeForStationDistance(
					departureStationSelection.departureTime,
					totalTime
				);

				const timeInput = document.getElementById('arrivalTimeLastStation');

				if (timeInput && activeArrival) {
					timeInput.value = formatTime(finalTime);
					timeInput.disabled = true;
					// console.log('Last Arrival Time:', timeInput.value)
				}
			} else {
				console.error('Path information not found.');
			}
		} catch (error) {
			console.error('Error updating last arrival station information:', error);
		}

		const relevantStationsForEnd = getStationsWithinDistance(stationCode);

		relevantStationsFromEnd = relevantStationsForEnd;

		console.log('Relevant Stations from End:', relevantStationsFromEnd);
	};

	const getStationInfoFromEvent = (event, relevantStations) => {
		const selectedStation = event.target.innerText;
		const stationCode = Object.keys(stationIndividualDetails).find(
			(code) => stationIndividualDetails[code].stationName === selectedStation
		);

		return { stationCode, stationName: selectedStation };
	};

	const handleClickForArrivalStation = async (event) => {
		try {
			const { stationCode, stationName } = getStationInfoFromEvent(
				event,
				relevantStationsFromDeparture
			);

			updateLastArrivalStationInfo(stationCode, stationName, relevantStationsFromDeparture);
		} catch (error) {
			console.error('Error handling click for arrival station:', error);
		}
	};

	const fetchItinerary = async () => {
		try {
			updating = true;
			const itineraryData = await api.simbus.itinerary.getItinerariesFromRouteNumber(
				params.routeCode,
				params.code
			);

			itineraryData.paths.forEach((path) => {
				const stationCode = path.busStation.stationCode;
				stationIndividualDetails[stationCode] = {
					pathId: path.itineraryPathId,
					stationName: path.busStation.stationName,
					position: path.sequenceOrder,
					departure: path.departureTime,
					arrival: path.arrivalTime,
					waiting: path.waitingTime
				};
			});

			itineraryDetails = itineraryData;

			updating = false;
		} catch (error) {
			console.error(error);
		}
	};

	const fetchDistancesBetweenStations = async () => {
		try {
			updating = true;

			const stationCodes = Object.keys(stationIndividualDetails);

			for (let i = 0; i < stationCodes.length; i++) {
				const stationCode1 = stationCodes[i];

				for (let j = i + 1; j < stationCodes.length; j++) {
					const stationCode2 = stationCodes[j];

					try {
						updating = true;

						const stopData = await api.simbus.distancesBetweenLocations.getBetweenLocations(
							stationCode1,
							stationCode2
						);

						if (stopData && stopData.totalDistanceInKm !== null && stopData.totalTime !== null) {
							betweenTwoStopsDetails = stopData;

							distances[`${stationCode1}-${stationCode2}`] = {
								stationName1: stationIndividualDetails[stationCode1].stationName,
								stationName2: stationIndividualDetails[stationCode2].stationName,
								totalTime: betweenTwoStopsDetails.totalTime,
								totalDistanceInKm: betweenTwoStopsDetails.totalDistanceInKm
							};
						} else {
							betweenTwoStopsDetails = {
								totalDistanceInKm: null,
								totalTime: null
							};
						}
					} catch (error) {
						console.error(error);
					} finally {
						updating = false;
					}
				}
			}
		} catch (error) {
			console.error(error);
		} finally {
			updating = false;
		}
	};

	onMount(async () => {
		try {
			updating = true;

			await fetchItinerary();
			await fetchDistancesBetweenStations();
		} catch (error) {
			console.error('Error fetching itinerary details:', error);
		} finally {
			updating = false;
		}
	});
</script>

<div class="d-flex align-items-center justify-content-between mb-4">
	<h1 class="h3 mb-0 text-gray-800">Editar Circulação</h1>
	<div class="d-none d-sm-inline-block">
		<button on:click|preventDefault={save} class="btn btn-sm btn-primary shadow-sm">
			{#if loading}
				<i class="fas fa-sync fa-spin fa-fw" />
			{:else}
				<i class="fas fa-save fa-sm" />
			{/if}
			&nbsp;Guardar
		</button>
		<button
			on:click|preventDefault={() => router.redirect(goBackPath)}
			class="btn btn-sm btn-secondary shadow-sm"
		>
			&nbsp;Voltar
		</button>
	</div>
	<div class="d-inline-block d-sm-none">
		<button on:click|preventDefault={save} class="btn btn-primary btn-circle">
			{#if updating}
				<i class="fas fa-sync fa-spin fa-fw" />
			{:else}
				<i class="fas fa-save fa-sm" />
			{/if}
		</button>
		<button
			on:click|preventDefault={() => router.redirect(goBackPath)}
			class="btn btn-secondary btn-circle"
		>
			<i class="fas fa-times fa-sm fa-fw" />
		</button>
	</div>
</div>

<div class="card shadow mb-4">
	<div class="card-body">
		<div class="d-flex flex-column">
			<div class="d-flex flex-row justify-content-start mb-5">
				<div class="mr-3">
					<h4 class="text-dark">Expresso</h4>
					<div>
						<select
							name="routeCode"
							class="custom-select"
							bind:value={itineraryDetails.routeCode}
							disabled={true}
						>
							{#if itineraryDetails}
								<option value={itineraryDetails.routeCode}>{itineraryDetails.routeCode}</option>
							{/if}
						</select>
					</div>
				</div>
				<div class="mr-3">
					<h4 class="text-dark">Circulação</h4>
					<div>
						<select
							name="itineraryNumber"
							class="custom-select"
							bind:value={itineraryDetails.itineraryNumber}
						>
							{#if itineraryDetails}
								<option value={itineraryDetails.itineraryNumber}
									>{itineraryDetails.itineraryNumber}</option
								>
							{/if}
						</select>
					</div>
				</div>
				<div class="mr-5">
					<h4 class="text-dark">Empresa</h4>
					<div>
						<select
							name="itineraryNumber"
							class="custom-select"
							bind:value={itineraryDetails.companyCode}
						>
							{#if itineraryDetails}
								<option value={itineraryDetails.companyCode}>{itineraryDetails.companyCode}</option>
							{/if}
						</select>
					</div>
				</div>
				<div class="d-flex flex-row">
					<div class="mr-3">
						<h4 class="text-dark">Inicio</h4>

						<input
							type="date"
							class="form-control"
							bind:value={beginFormattedDate}
							max="2045-01-01"
						/>
					</div>

					<div class="mr-5">
						<h4 class="text-dark">Fim</h4>

						<input
							type="date"
							class="form-control"
							bind:value={endFormattedDate}
							max="2025-01-01"
						/>
					</div>
				</div>
				<div class="d-flex flex-row mt-4 pt-3">
					<h4 class="text-dark">Ativo</h4>
					<div class="custom-control custom-checkbox ml-2">
						<input
							type="checkbox"
							class="custom-control-input"
							id="customCheck"
							name="example1"
							bind:checked={itineraryDetails.isActive}
						/>
						<label class="custom-control-label" for="customCheck"></label>
					</div>
				</div>
			</div>
			<!-- Count the time between stops COMPONENT -->
			<div class="d-flex flex-column">
				<div class="d-flex flex-row justify-content-start mb-2">
					<div class="mr-3">
						<h4 class="text-dark">Paragens</h4>
					</div>
					<div>
						{#if activeDeparture && activeArrival}
							<button class="btn btn-sm btn-primary" id="addStationButton" on:click={addEmptySelect}
								>+ Adicionar</button
							>
						{:else}
							<button class="btn btn-sm btn-primary" id="addStationButton" disabled
								>+ Adicionar</button
							>
						{/if}
					</div>
					<div class="ml-3">
						<button
							class="btn btn-sm btn-primary"
							id="clearAllStationButton"
							on:click={clearAllStations}>Limpar</button
						>
					</div>
				</div>
				<div class="d-flex flex-row input-group mt-3 mb-1 justify-content-start">
					<div class="input-group-prepend">
						<button
							type="button"
							class="btn btn-primary text-white dropdown-toggle rounded-lg btn-width"
							data-toggle="dropdown"
							id="departureButton"
						>
							{#if departureStationSelection.code !== null && departureStationSelection.name !== null}
								{departureStationSelection.name}
							{:else}
								Partida
							{/if}
						</button>
						<div class="dropdown-menu">
							{#each itineraryDetails.paths.sort((a, b) => a.sequenceOrder - b.sequenceOrder) as station (station.busStation.stationCode)}
								<a
									class="dropdown-item"
									href="#"
									id={`departureDropdown-${itineraryDetails.itineraryPathId}-${station.busStation.stationCode}`}
									on:click={() => handleButtonClickForFirstStation(station.busStation.stationCode)}
								>
									{station.busStation.stationName}
								</a>
							{/each}
						</div>
					</div>
					<div class="ml-2">
						<input
							type="time"
							class="form-control time-input-width"
							value="00:00"
							id={`departureTimeInput-${itineraryDetails.itineraryPathId}`}
						/>
					</div>
					<div class="ml-2">
						<input type="time" class="form-control invisible time-input-width" value="00:00" />
					</div>
					<div class="ml-2">
						<input type="time" class="form-control invisible time-input-width" value="00:00" />
					</div>
				</div>
				<!-- MIDDLE STATIONS -->
				<div class="d-flex flex-row input-group mt-3 mb-2">
					<div class="input-group mt-3 mb-2" id="container-to-be-filled"></div>
				</div>

				<!-- LAST STATION -->
				<div class="input-group mt-3 mb-2 d-flex flex-row justify-content-start">
					<div class="input-group-prepend">
						<button
							type="button"
							class="btn btn-primary text-white dropdown-toggle rounded-lg btn-width"
							id="arrivalSelectedStationButton"
							data-toggle="dropdown"
						>
							{#if arrivalStationSelection.name === null}
								Chegada
							{:else}
								{arrivalStationSelection.name}
							{/if}
						</button>
						<div class="dropdown-menu">
							{#each relevantStationsFromDeparture as stationName}
								<a class="dropdown-item" href="#" on:click={handleClickForArrivalStation}>
									{stationName}
								</a>
							{/each}
						</div>
					</div>
					<div class="ml-2">
						<input type="time" class="form-control invisible time-input-width" value="00:00" />
					</div>
					<div class="ml-2">
						<input
							type="time"
							class="form-control time-input-width"
							value="00:00"
							id="arrivalTimeLastStation"
						/>
					</div>
					<div class="ml-2">
						<input type="time" class="form-control invisible time-input-width" value="00:00" />
					</div>
				</div>
				{#if warning}
					<div>
						<p class="text-danger">Chegada apenas disponível para:</p>
						<ul>
							{#each relevantStationsFromEnd as stationName}
								<li>{stationName}</li>
							{/each}
						</ul>
					</div>
				{:else}
					<div class="invisible">
						<p class="text-danger"></p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
