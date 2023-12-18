<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import router from 'page';
	import * as api from '../../../api';
	import Overlay from '../../../components/controls/Overlay.svelte';

	export let params;

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

	$: goBackPath =
		params && params.routeCode && params.variantCode
			? `/simbus/routes/${params.routeCode}`
			: '/simbus/itineraries';

	$: if (goBackPath) console.log(goBackPath);

	const save = async () => {
		if (updating) return;
		updating = true;

		try {
		} catch (error) {
			console.error('Error updating itinerary:', error);
		} finally {
			updating = false;
		}
	};

	// Hardcoded values for "Inicio" and "Fim"
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

	// Binding formatted dates
	$: beginFormattedDate = formatDate(beginDateStr);
	$: endFormattedDate = formatDate(endDateStr);

	// Function to add an empty select + 3 empty time inputs + rnadom ID
	const addEmptySelect = () => {
		console.log('Adding empty select...');

		const newEmptyPath = {
			itineraryPathId: generateUniqueId(),
			routeCode: params.routeCode,
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
			updating = true;
			const data = await api.simbus.itinerary.getItinerariesFromRouteNumber(
				params.routeCode,
				params.code
			);
			itineraryDetailsStore.set(data);
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
		<div class="">
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
							<div class="mb-2">
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
			<div class="d-flex flex-row mb-5">
				<div>
					<h4 class="text-dark">Sazonalidade Disponibilidade</h4>
					<div>
						<select name="cars" class="custom-select">
							<option selected>Custom Select Menu</option>
							<option value="volvo">Volvo</option>
						</select>
					</div>
				</div>
			</div>
			<div class="d-flex flex-row mb-5">
				<div>
					<div class="d-flex flex-block mb-3">
						<h4 class="pr-3 text-dark">Excepções de datas</h4>
						<button class="btn btn-sm btn-primary shadow-sm"
							><i class="fa-solid fa-plus"></i>&nbsp;Adicionar</button
						>
					</div>
					<div class="d-flex flex-block">
						<input type="date" class="form-control mr-2" />
						<div class="mt-1 pr-2"><p><b>a</b></p></div>
						<input type="date" class="form-control" />
					</div>
				</div>
			</div>
			<div class="d-flex flex-column mb-5">
				<h4 class="text-dark mb-3">Dias da semana</h4>

				<div class="d-flex flex-row justify-content-start mb-3">
					<div
						class="form-check mr-3 d-flex flex-column justify-content-center text-center items-center"
					>
						<div>
							<p class="edited-custom-font">Segunda</p>
						</div>
						<div class="ml-4">
							<input
								class="form-check-input"
								type="checkbox"
								value=""
								id="flexCheckChecked"
								checked
							/>
						</div>
					</div>
					<div
						class="form-check mr-3 d-flex flex-column justify-content-center text-center items-center"
					>
						<div>
							<p class="edited-custom-font">Terça</p>
						</div>
						<div class="ml-4">
							<input
								class="form-check-input"
								type="checkbox"
								value=""
								id="flexCheckChecked"
								checked
							/>
						</div>
					</div>
					<div
						class="form-check mr-3 d-flex flex-column justify-content-center text-center items-center"
					>
						<div>
							<p class="edited-custom-font">Quarta</p>
						</div>
						<div class="ml-4">
							<input
								class="form-check-input"
								type="checkbox"
								value=""
								id="flexCheckChecked"
								checked
							/>
						</div>
					</div>
					<div
						class="form-check mr-3 d-flex flex-column justify-content-center text-center items-center"
					>
						<div>
							<p class="edited-custom-font">Quinta</p>
						</div>
						<div class="ml-4">
							<input
								class="form-check-input"
								type="checkbox"
								value=""
								id="flexCheckChecked"
								checked
							/>
						</div>
					</div>
					<div
						class="form-check mr-3 d-flex flex-column justify-content-center text-center items-center"
					>
						<div>
							<p class="edited-custom-font">Sexta</p>
						</div>
						<div class="ml-4">
							<input
								class="form-check-input"
								type="checkbox"
								value=""
								id="flexCheckChecked"
								checked
							/>
						</div>
					</div>
					<div
						class="form-check mr-3 d-flex flex-column justify-content-center text-center items-center"
					>
						<div>
							<p class="edited-custom-font">Sabado</p>
						</div>
						<div class="ml-4">
							<input
								class="form-check-input"
								type="checkbox"
								value=""
								id="flexCheckChecked"
								checked
							/>
						</div>
					</div>
					<div
						class="form-check mr-3 d-flex flex-column justify-content-center text-center items-center"
					>
						<div>
							<p class="edited-custom-font">Domingo</p>
						</div>
						<div class="ml-4">
							<input
								class="form-check-input"
								type="checkbox"
								value=""
								id="flexCheckChecked"
								checked
							/>
						</div>
					</div>
				</div>
			</div>
			<div class="d-flex flex-column mb-5">
				<h4 class="text-dark mb-3">Feriados Nacionais</h4>
				<h5><b>A circulação efetua-se:</b></h5>
				<div class="d-flex flex-row justify-content-start mb-5 pb-2">
					<div
						class="form-check mr-3 d-flex flex-column justify-content-center text-center items-center"
					>
						<div>
							<p class="edited-custom-font">Na Véspera</p>
						</div>
						<div class="ml-4">
							<input
								class="form-check-input"
								type="checkbox"
								value=""
								id="flexCheckChecked"
								checked
							/>
						</div>
					</div>
					<div
						class="form-check mr-3 d-flex flex-column justify-content-center text-center items-center"
					>
						<div>
							<p class="edited-custom-font">No feriado</p>
						</div>
						<div class="ml-4">
							<input
								class="form-check-input"
								type="checkbox"
								value=""
								id="flexCheckChecked"
								checked
							/>
						</div>
					</div>
					<div
						class="form-check mr-3 d-flex flex-column justify-content-center text-center items-center"
					>
						<div>
							<p class="edited-custom-font">No dia seguinte</p>
						</div>
						<div class="ml-4">
							<input
								class="form-check-input"
								type="checkbox"
								value=""
								id="flexCheckChecked"
								checked
							/>
						</div>
					</div>
				</div>
				<h5><b>Se o feriado for no dia da semana:</b></h5>
				<div class="d-flex flex-row mb-5 justify-content-start pb-2">
					<div
						class="form-check mr-3 d-flex flex-column justify-content-center text-center items-center"
					>
						<div>
							<p class="edited-custom-font">Segunda</p>
						</div>
						<div class="ml-4">
							<input
								class="form-check-input"
								type="checkbox"
								value=""
								id="flexCheckChecked"
								checked
							/>
						</div>
					</div>
					<div
						class="form-check mr-3 d-flex flex-column justify-content-center text-center items-center"
					>
						<div>
							<p class="edited-custom-font">Terça</p>
						</div>
						<div class="ml-4">
							<input
								class="form-check-input"
								type="checkbox"
								value=""
								id="flexCheckChecked"
								checked
							/>
						</div>
					</div>
					<div
						class="form-check mr-3 d-flex flex-column justify-content-center text-center items-center"
					>
						<div>
							<p class="edited-custom-font">Quarta</p>
						</div>
						<div class="ml-4">
							<input
								class="form-check-input"
								type="checkbox"
								value=""
								id="flexCheckChecked"
								checked
							/>
						</div>
					</div>
					<div
						class="form-check mr-3 d-flex flex-column justify-content-center text-center items-center"
					>
						<div>
							<p class="edited-custom-font">Quinta</p>
						</div>
						<div class="ml-4">
							<input
								class="form-check-input"
								type="checkbox"
								value=""
								id="flexCheckChecked"
								checked
							/>
						</div>
					</div>
					<div
						class="form-check mr-3 d-flex flex-column justify-content-center text-center items-center"
					>
						<div>
							<p class="edited-custom-font">Sexta</p>
						</div>
						<div class="ml-4">
							<input
								class="form-check-input"
								type="checkbox"
								value=""
								id="flexCheckChecked"
								checked
							/>
						</div>
					</div>
				</div>

				<div class="d-flex flex-row justify-content-start">
					<div class="custom-control custom-switch mr-5 mt-2 ml-2">
						<input type="checkbox" class="custom-control-input" id="switch1" />
						<label class="custom-control-label text-dark" for="switch1">Publish</label>
					</div>
					<div>
						<input type="date" class="form-control" />
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<Overlay show={loading} />

<style>
	.edited-custom-font {
		font-size: 18px;
	}
</style>
