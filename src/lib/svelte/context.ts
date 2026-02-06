import { getContext, setContext } from 'svelte';
import type { ModalContext } from '../core/types.js';

export const MODAL_CONTEXT = Symbol.for('svelte-supermodals.modal-context');
const LEGACY_MODAL_CONTEXT = 'modal';

export const setModalContext = (modalContext: ModalContext) => {
	setContext(MODAL_CONTEXT, modalContext);
	// Compatibility for projects using string-keyed context in existing code.
	setContext(LEGACY_MODAL_CONTEXT, modalContext);
	return modalContext;
};

export const useModal = (): ModalContext => {
	const context =
		getContext<ModalContext | undefined>(MODAL_CONTEXT) ??
		getContext<ModalContext | undefined>(LEGACY_MODAL_CONTEXT);

	if (!context) {
		throw new Error('No modal context found. Wrap your app with <ModalProvider>.');
	}

	return context;
};
