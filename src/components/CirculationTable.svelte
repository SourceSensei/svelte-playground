<div class="table-responsive">
	<table class="table" id="dataTable" width="100%" cellspacing="0">
		<thead>
			<tr>
				<th style="width:100px;">Variante</th>
				<th style="width:100px;">Sentido</th>
				<th>Nº Circulação</th>
				<th>Nº Bus</th>
				<th>Partida</th>
				<th>Chegada</th>
				<th style="width:60px;" />
			</tr>
		</thead>
		<tbody>
			{#each itineraries.filter((i) => !selectedVariant || selectedVariant.value == i.variantCode) as item, i}
				{#each route.routeVariants.filter((v) => v.routeVariantCode == item.variantCode) as variant}
					<tr class="align-middle">
						<td>{variant.routeVariantCode}</td>
						<td
							>{routeDirectionOptions.find((t) => t.value == variant.direction)?.label ||
								variant.direction}</td
						>
						<td>{item.itineraryNumber}</td>
						<td>{item.busNumber}</td>
						<td><b>{item.departureTime}</b> {item.departureStation}</td>
						<td><b>{item.arrivalTime}</b> {item.arrivalStation}</td>
						<td>
							<button
								title="Alterar Variante"
								on:click|preventDefault={() =>
									router.redirect(
										`/simbus/routes/${item.routeCode}/variant/${item.variantCode}/itinerary/${item.itineraryNumber}`
									)}
								class="btn btn-sm btn-secondary shadow-sm"
							>
								<i class="fas fa-pen fa-sm" />
							</button>
						</td>
					</tr>
				{/each}
			{:else}
				<tr>
					<td colspan="100%">
						{#if !loading}
							<h5 class="text-center">Sem resultados...</h5>
						{:else}
							<p class="text-center">
								<i class="fas fa-sync fa-spin fa-fw" />
								<em>A carregar dados...</em>
							</p>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
