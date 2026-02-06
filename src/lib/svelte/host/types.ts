import type { Component } from 'svelte';
import type { ModalExports } from '../../core/types.js';

export type ModalHostProps = {
	open: boolean;
	modal: ModalExports | null;
	onRequestClose: () => void;
	onOpenChange?: (open: boolean) => void;
};

export type ModalHostComponent = Component<ModalHostProps>;
