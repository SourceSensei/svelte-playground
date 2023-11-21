<script>
	import { onMount } from 'svelte';

	let users = [];

	let userCardTemplate;
	let userCardContainer;
	let searchInput;

	onMount(() => {
		userCardTemplate = document.querySelector('[data-user-template]');
		userCardContainer = document.querySelector('[data-user-cards-container]');
		searchInput = document.querySelector('[data-search]');

		searchInput.addEventListener('input', (e) => {
			const value = e.target.value.toLowerCase();
			users.forEach((user) => {
				const isVisible =
					(user.name && user.name.toLowerCase().includes(value)) ||
					user.email.toLowerCase().includes(value);
				user.element.classList.toggle('hide', !isVisible);
			});
		});

		fetch('https://jsonplaceholder.typicode.com/users')
			.then((res) => res.json())
			.then((data) => {
				users = data.map((user) => {
					const card = userCardTemplate.content.cloneNode(true).children[0];
					const header = card.querySelector('[data-header]');
					const body = card.querySelector('[data-body]');
					header.textContent = user.name;
					body.textContent = user.email;
					userCardContainer.append(card);

					return {
						name: user.name,
						email: user.email,
						element: card
					};
				});
			});
	});
</script>

<section>
	<div class="search-wrapper">
		<label for="search">Search Users</label>
		<input type="search" id="search" data-search />
	</div>
	<div class="user-cards" data-user-cards-container>
		<template data-user-template>
			<div class="card hide">
				<div class="header" data-header>Ny name</div>
				<div class="body" data-body>test@gmail.com</div>
			</div>
		</template>
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
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
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
