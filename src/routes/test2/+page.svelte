<script>
	import { onMount } from 'svelte';

	function calculateTimeSum() {
		const timeInput1 = document.getElementById('timeInput1').value;
		const timeInput2 = document.getElementById('timeInput2').value;

		const time1 = new Date(`1970-01-01T${timeInput1}:00Z`);
		const time2 = new Date(`1970-01-01T${timeInput2}:00Z`);

		const totalMilliseconds = time1.getTime() + time2.getTime();
		const totalTime = new Date(totalMilliseconds);

		const hours = totalTime.getUTCHours();
		const minutes = totalTime.getUTCMinutes();

		const formattedSum = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
		document.getElementById('sumResult').textContent = formattedSum;
	}

	onMount(() => {
		document.getElementById('timeInput1').addEventListener('input', calculateTimeSum);
		document.getElementById('timeInput2').addEventListener('input', calculateTimeSum);
	});
</script>

<div class="d-flex flex-column justify-content-center align-items-center text-center">
	<div class="d-flex flex-column">
		<div class="mb-5">
			<h1>Date/Time Playground 2</h1>
		</div>
		<div>
			<div class="mb-5">
				<label for="timeInput1">Time 1:</label>
				<input type="time" class="form-control" id="timeInput1" name="timeInput1" />
			</div>
			<div>
				<label for="timeInput2">Time 2:</label>
				<input type="time" class="form-control" id="timeInput2" name="timeInput2" />
			</div>
		</div>
		<div>
			<h3>Sum of Times:</h3>
			<span id="sumResult">--:--</span>
		</div>
	</div>
</div>
