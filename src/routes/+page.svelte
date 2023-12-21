<script>
	import City from './city/+page.svelte';
</script>

<main class="main-container">
	<h1>Welcome to SvelteKit Playground</h1>
	<p>Use "/" to navigate between pages or the nav</p>
	<nav>
		<a href="/city">City</a>
		<a href="/checkpaths">Check Paths</a>
		<a href="/checkroutes">Check Routes</a>
		<a href="/tooltip">Tooltip</a>
		<a href="/datePlayground">Date/Time Playground</a>
	</nav>
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
