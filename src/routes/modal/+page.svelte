<script>
	import { onMount } from 'svelte';

	let myModal;
	let myInput;

	onMount(() => {
		myModal = new bootstrap.Modal(document.getElementById('exampleModal'));
		myInput = document.getElementById('myInput');

		myModal.show();

		myModal._element.addEventListener('shown.bs.modal', () => {
			myInput.focus();
		});
	});
</script>

<section class="main-section">
	<!-- Button trigger modal -->
	<button
		type="button"
		class="btn btn-primary"
		data-bs-toggle="modal"
		data-bs-target="#exampleModal"
	>
		Launch demo modal
	</button>

	<!-- Modal -->
	<div
		class="modal fade"
		id="exampleModal"
		tabindex="-1"
		aria-labelledby="exampleModalLabel"
		aria-hidden="true"
	>
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h1 class="modal-title fs-5" id="exampleModalLabel">Modal title</h1>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
					></button>
				</div>
				<div class="modal-body">...</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
					<button type="button" class="btn btn-primary">Save changes</button>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Bootstrap JS (popper.js and bootstrap.js) should be included before this script -->
<!-- You can include Bootstrap JS from a CDN or download and host it locally -->

<style>
	.main-section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		height: 100vh;
	}
</style>
