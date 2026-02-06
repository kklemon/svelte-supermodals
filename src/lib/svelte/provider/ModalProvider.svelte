<script lang="ts">
	import { getAllContexts, onDestroy, type Snippet } from 'svelte';
	import { createModalController } from '../../core/modal-controller.js';
	import type {
		ModalComponent,
		ModalContext,
		ModalExports,
		ModalOpenOptions
	} from '../../core/types.js';
	import ModalHost from '../host/ModalHost.svelte';
	import type { ModalHostComponent } from '../host/types.js';
	import { mountModal, type MountedModal } from '../mount-modal.js';
	import { setModalContext } from '../context.js';

	type ProviderProps = {
		children: Snippet;
		queueDelayMs?: number;
		submitOnEnterDefault?: boolean;
		host?: ModalHostComponent;
		hostProps?: Record<string, unknown>;
		mountTarget?: Element | ShadowRoot;
	};

	let {
		children,
		queueDelayMs = 150,
		submitOnEnterDefault = false,
		host = ModalHost,
		hostProps = {},
		mountTarget
	}: ProviderProps = $props();

	const contexts = getAllContexts();

	const controller = createModalController<MountedModal>({
		onDropStack: (stack) => {
			for (const modal of stack) {
				modal.dispose();
			}
		}
	});

	$effect(() => {
		controller.setQueueDelayMs(queueDelayMs);
	});

	let currentStack = $state<MountedModal[]>([]);
	let isOpen = $state(false);

	const unsubscribe = controller.subscribe((state) => {
		currentStack = state.currentStack;
		isOpen = state.isOpen;
	});

	onDestroy(() => {
		unsubscribe();
		controller.destroy();
	});

	const mountEntry = <
		Props extends Record<string, unknown> = Record<string, unknown>,
		Exports extends Partial<ModalExports> = ModalExports,
		Bindings extends string = string
	>(
		modal: ModalComponent<Props, Exports, Bindings>,
		options: ModalOpenOptions<Props> = {}
	): MountedModal => {
		return mountModal(modal, {
			props: options.props,
			context: contexts,
			target: mountTarget
		});
	};

	const modalContext: ModalContext = {
		setModalContent: (content) => {
			controller.setModalContent({
				exports: content,
				dispose: () => undefined
			});
		},
		open: (modal, options) => {
			controller.openStack([mountEntry(modal, options)]);
		},
		push: (modal, options) => {
			controller.push(mountEntry(modal, options));
		},
		enqueue: (modal, options) => {
			controller.enqueueStack([mountEntry(modal, options)]);
		},
		pop: () => {
			controller.pop();
		},
		canPop: () => controller.canPop(),
		dequeue: () => {
			controller.dequeue();
		},
		close: () => {
			controller.close();
		}
	};

	setModalContext(modalContext);

	const activeModal = $derived(currentStack.at(-1)?.exports ?? null);
	let Host = $derived(host);

	const onOpenChange = (open: boolean) => {
		if (!open) {
			modalContext.close();
		}
	};

	const isInteractiveTarget = (target: EventTarget | null) => {
		if (!(target instanceof HTMLElement)) return false;

		return !!target.closest(
			'button, [role="button"], input, textarea, select, a, [contenteditable="true"]'
		);
	};

	const handleWindowKeydown = (event: KeyboardEvent) => {
		if (!isOpen) return;
		if (event.defaultPrevented) return;
		if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
		if (event.key !== 'Enter' && event.key !== 'NumpadEnter') return;

		const callbacks = activeModal?.callbacks;
		if (!callbacks?.onEnter) return;

		const shouldSubmitOnEnter = activeModal?.config?.submitOnEnter ?? submitOnEnterDefault;
		if (!shouldSubmitOnEnter) return;
		if (isInteractiveTarget(event.target)) return;

		callbacks.onEnter(event);
	};
</script>

<svelte:window onkeydown={handleWindowKeydown} />

{#if activeModal}
	<Host
		{...hostProps}
		open={isOpen}
		modal={activeModal}
		onRequestClose={modalContext.close}
		{onOpenChange}
	/>
{/if}

{@render children()}
