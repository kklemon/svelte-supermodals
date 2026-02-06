<script lang="ts">
	import { useModal } from '$lib/index.js';
	import DemoModal from './DemoModal.svelte';

	const modal = useModal();

	let enterSubmissionCount = $state(0);
	let events = $state<string[]>([]);

	const log = (entry: string) => {
		events = [`${new Date().toLocaleTimeString()} - ${entry}`, ...events].slice(0, 10);
	};

	const openBasicModal = () => {
		modal.open(DemoModal, {
			props: {
				titleText: 'Basic modal',
				bodyText: 'This modal uses the default host and can be closed directly.'
			}
		});
		log('Opened basic modal');
	};

	const openStackDemo = () => {
		modal.open(DemoModal, {
			props: {
				titleText: 'Stack step 1',
				bodyText: 'Root modal in the current stack.'
			}
		});
		modal.push(DemoModal, {
			props: {
				titleText: 'Stack step 2',
				bodyText: 'Use Back to return to step 1.',
				showBack: true
			}
		});
		modal.push(DemoModal, {
			props: {
				titleText: 'Stack step 3',
				bodyText: 'Top of stack. Back pops this modal.',
				showBack: true
			}
		});
		log('Opened a 3-step stack');
	};

	const enqueueModal = () => {
		modal.enqueue(DemoModal, {
			props: {
				titleText: 'Queued modal',
				bodyText: 'This opens after the active stack closes.'
			}
		});
		log('Queued one modal');
	};

	const openStackThenEnqueue = () => {
		openStackDemo();
		enqueueModal();
		log('Opened stack and queued follow-up');
	};

	const openEnterSubmitModal = () => {
		modal.open(DemoModal, {
			props: {
				titleText: 'Enter-submit modal',
				bodyText: 'Press Enter outside inputs/buttons to trigger callbacks.onEnter.',
				submitOnEnter: true,
				onEnterSubmit: () => {
					enterSubmissionCount += 1;
					log(`Enter submit callback fired (${enterSubmissionCount})`);
					modal.close();
				}
			}
		});
		log('Opened Enter-submit modal');
	};

	const closeAndDequeue = () => {
		modal.dequeue();
		log('Dequeued/closed current stack');
	};
</script>

<main class="demo-page">
	<h1>Svelte Supermodals Demo</h1>
	<p>
		This page exercises the library API: <code>open</code>, <code>push</code>, <code>enqueue</code>,
		<code>pop</code>, <code>dequeue</code>, and configurable Enter-submit callbacks.
	</p>

	<section class="controls">
		<button type="button" onclick={openBasicModal}>Open Basic Modal</button>
		<button type="button" onclick={openStackDemo}>Open Stack (3)</button>
		<button type="button" onclick={enqueueModal}>Enqueue Modal</button>
		<button type="button" onclick={openStackThenEnqueue}>Open Stack + Enqueue</button>
		<button type="button" onclick={openEnterSubmitModal}>Open Enter-Submit Modal</button>
		<button type="button" onclick={closeAndDequeue}>Dequeue Current</button>
	</section>

	<section class="meta">
		<p><strong>Enter submit count:</strong> {enterSubmissionCount}</p>
	</section>

	<section class="events">
		<h2>Recent events</h2>
		{#if events.length === 0}
			<p>No events yet.</p>
		{:else}
			<ul>
				{#each events as event (event)}
					<li>{event}</li>
				{/each}
			</ul>
		{/if}
	</section>
</main>

<style>
	.demo-page {
		max-width: 64rem;
		margin: 0 auto;
		padding: 2rem 1rem 3rem;
		display: grid;
		gap: 1.25rem;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}

	button {
		border: 1px solid rgb(188 198 209);
		border-radius: 0.5rem;
		background: white;
		padding: 0.45rem 0.8rem;
		cursor: pointer;
	}

	button:hover {
		background: rgb(246 248 251);
	}

	.events ul {
		margin: 0;
		padding-left: 1.2rem;
	}
</style>
