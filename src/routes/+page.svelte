<script>
	import CheckItinerary from './checkitinerary/+page.svelte';
	import CheckPaths from './checkpaths/+page.svelte';
	import CheckRoutes from './checkroutes/+page.svelte';
	import Modal from './modal/+page.svelte';
	import Shop from './shop/+page.svelte';
	import Search from './search/+page.svelte';
</script>

<main class="main-container">
	<h1>Welcome to SvelteKit Playground</h1>

	<div>
		<nav>
			<div>
				<a href="/checkitinerary">Itinerary</a>
			</div>
			<div>
				<a href="/checkpaths">Paths</a>
			</div>
			<div>
				<a href="/checkroutes">Routes</a>
			</div>
			<div>
				<a href="/modal">Modal Example</a>
			</div>
			<!-- <div>
				<a href="/shop">Shop Example</a>
			</div> -->
			<div>
				<a href="/search">Search Example</a>
			</div>
		</nav>
	</div>
</main>

<style>
	.main-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		padding: 1em;
	}
</style>
