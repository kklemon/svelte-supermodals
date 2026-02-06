export { createModalController } from './core/modal-controller.js';

export type {
	CreateModalControllerOptions,
	ModalController,
	ModalControllerListener,
	ModalControllerState
} from './core/modal-controller.js';

export type {
	ModalCallbacks,
	ModalComponent,
	ModalContext,
	ModalExports,
	ModalOpenOptions,
	ModalStack,
	ModalViewConfig
} from './core/types.js';

export { MODAL_CONTEXT, setModalContext, useModal } from './svelte/context.js';
export { default as ModalHost } from './svelte/host/ModalHost.svelte';
export type { ModalHostComponent, ModalHostProps } from './svelte/host/types.js';
export { default as ModalProvider } from './svelte/provider/ModalProvider.svelte';
