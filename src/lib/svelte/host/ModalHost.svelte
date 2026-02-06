<script module lang="ts">
	let hostId = 0;
	const nextHostId = () => {
		hostId += 1;
		return hostId;
	};
</script>

<script lang="ts">
	import type { ModalHostProps } from './types.js';

	let { open, modal, onRequestClose, onOpenChange }: ModalHostProps = $props();

	let panelElement: HTMLElement | null = $state(null);
	const titleId = `supermodal-title-${nextHostId()}`;

	const dismissible = $derived(modal?.config?.dismissible ?? true);

	const panelClassName = $derived.by(() => {
		const ui = modal?.config?.ui;
		if (!ui || typeof ui !== 'object') return '';

		const className = (ui as Record<string, unknown>).className;
		return typeof className === 'string' ? className : '';
	});

	const requestClose = () => {
		if (!dismissible) return;

		onOpenChange?.(false);
		onRequestClose();
	};

	const handleBackdropClick = (event: MouseEvent) => {
		if (event.target !== event.currentTarget) return;
		requestClose();
	};

	const handleWindowKeydown = (event: KeyboardEvent) => {
		if (!open) return;
		if (!dismissible) return;
		if (event.defaultPrevented) return;
		if (event.key !== 'Escape') return;

		event.preventDefault();
		requestClose();
	};

	$effect(() => {
		if (!open || !panelElement) return;
		panelElement.focus();
	});

	$effect(() => {
		if (!open || typeof document === 'undefined') return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	});
</script>

<svelte:window onkeydown={handleWindowKeydown} />

{#if open && modal}
	<div class="supermodal-backdrop" role="presentation" onclick={handleBackdropClick}>
		<div
			bind:this={panelElement}
			class={`supermodal-panel ${panelClassName}`.trim()}
			role="dialog"
			aria-modal="true"
			aria-labelledby={modal.title ? titleId : undefined}
			tabindex="-1"
		>
			{#if modal.config?.showCloseButton !== false}
				<div class="supermodal-close">
					<button
						type="button"
						class="supermodal-close-button"
						aria-label="Close modal"
						onclick={requestClose}
						disabled={!dismissible}
					>
						Close
					</button>
				</div>
			{/if}

			{#if modal.title}
				<div class="supermodal-title" id={titleId}>
					{@render modal.title()}
				</div>
			{/if}

			{#if modal.body}
				<div class="supermodal-body">
					{@render modal.body()}
				</div>
			{/if}

			{#if modal.footer}
				<div class="supermodal-footer">
					{@render modal.footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.supermodal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: rgb(10 10 10 / 55%);
	}

	.supermodal-panel {
		width: min(100%, 42rem);
		max-height: min(90vh, 52rem);
		overflow: auto;
		border: 1px solid rgb(223 228 235);
		border-radius: 0.75rem;
		background: #ffffff;
		color: rgb(20 24 30);
		box-shadow: 0 18px 54px rgb(10 10 10 / 30%);
		padding: 1rem;
	}

	.supermodal-panel:focus {
		outline: 2px solid rgb(31 116 255);
		outline-offset: 1px;
	}

	.supermodal-close {
		display: flex;
		justify-content: flex-end;
	}

	.supermodal-close-button {
		border: 1px solid rgb(206 214 223);
		border-radius: 0.45rem;
		background: transparent;
		padding: 0.25rem 0.65rem;
		font-size: 0.85rem;
		cursor: pointer;
	}

	.supermodal-close-button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.supermodal-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin-top: 0.25rem;
	}

	.supermodal-body {
		margin-top: 0.75rem;
	}

	.supermodal-footer {
		margin-top: 1rem;
	}
</style>
