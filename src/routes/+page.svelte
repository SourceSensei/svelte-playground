<script>
	import { onMount } from 'svelte';

	
</script>

<section>
	<div class="search-wrapper">
		<label for="search">Search Users</label>
		<input type="search" id="search" />
	</div>
	<div class="user-cards">
		<div class="card">
			<div class="header">Ny name</div>
			<div class="body">test@gmail.com</div>
		</div>
		<div class="card">
			<div class="header">Ny name</div>
			<div class="body">test@gmail.com</div>
		</div>
		<div class="card">
			<div class="header">Ny name</div>
			<div class="body">test@gmail.com</div>
		</div>
		<div class="card">
			<div class="header">Ny name</div>
			<div class="body">test@gmail.com</div>
		</div>
	</div>
</section>

<style>
	.search-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	input {
		font-size: 1rem;
	}

	.user-cards {
		display: grid;
		grid-template-columns: repeat(auto-fil, minmax(150px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.card {
		border: 1px solid black;
		padding: 1rem;
		border-radius: 0.5rem;
	}

	.hide {
		display: none;
	}
</style>
