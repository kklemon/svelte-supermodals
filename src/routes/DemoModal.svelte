<script lang="ts">
	import { useModal } from '$lib/index.js';
	import type { ModalCallbacks, ModalViewConfig } from '$lib/index.js';

	let {
		titleText,
		bodyText,
		showBack = false,
		showClose = true,
		submitOnEnter = false,
		onEnterSubmit
	}: {
		titleText: string;
		bodyText: string;
		showBack?: boolean;
		showClose?: boolean;
		submitOnEnter?: boolean;
		onEnterSubmit?: () => void;
	} = $props();

	const modal = useModal();

	const callbacks: ModalCallbacks = {
		onEnter: () => {
			onEnterSubmit?.();
		}
	};

	const config = $derived.by(
		(): ModalViewConfig => ({
			submitOnEnter
		})
	);

	const handleBack = () => {
		if (modal.canPop()) modal.pop();
	};

	export { title, body, footer, config, callbacks };
</script>

{#snippet title()}
	{titleText}
{/snippet}

{#snippet body()}
	<p>{bodyText}</p>
{/snippet}

{#snippet footer()}
	<div class="demo-modal-footer">
		{#if showBack}
			<button type="button" onclick={handleBack} disabled={!modal.canPop()}>Back</button>
		{/if}
		{#if showClose}
			<button type="button" onclick={() => modal.close()}>Close</button>
		{/if}
	</div>
{/snippet}

<style>
	.demo-modal-footer {
		display: flex;
		width: 100%;
		justify-content: space-between;
		gap: 0.5rem;
	}
</style>
