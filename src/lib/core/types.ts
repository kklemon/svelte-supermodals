import type { Component, Snippet } from 'svelte';

export type ModalCallbacks = {
	onEnter?: (event: KeyboardEvent) => void;
};

export type ModalViewConfig = {
	dismissible?: boolean;
	showCloseButton?: boolean;
	submitOnEnter?: boolean;
	ui?: Record<string, unknown>;
};

export type ModalExports = {
	title?: Snippet;
	body?: Snippet;
	footer?: Snippet;
	config?: ModalViewConfig;
	callbacks?: ModalCallbacks;
};

export type ModalStack = ModalExports[];

export type ModalComponent<
	Props extends Record<string, unknown> = Record<string, unknown>,
	Exports extends Partial<ModalExports> = ModalExports,
	Bindings extends string = string
> = Component<Props, Exports & ModalExports, Bindings>;

export type ModalOpenOptions<Props extends Record<string, unknown> = Record<string, unknown>> = {
	props?: Props;
};

export interface ModalContext {
	setModalContent: (content: ModalExports) => void;
	open: <
		Props extends Record<string, unknown> = Record<string, unknown>,
		Exports extends Partial<ModalExports> = ModalExports,
		Bindings extends string = string
	>(
		modal: ModalComponent<Props, Exports, Bindings>,
		options?: ModalOpenOptions<Props>
	) => void;
	close: () => void;
	push: <
		Props extends Record<string, unknown> = Record<string, unknown>,
		Exports extends Partial<ModalExports> = ModalExports,
		Bindings extends string = string
	>(
		modal: ModalComponent<Props, Exports, Bindings>,
		options?: ModalOpenOptions<Props>
	) => void;
	enqueue: <
		Props extends Record<string, unknown> = Record<string, unknown>,
		Exports extends Partial<ModalExports> = ModalExports,
		Bindings extends string = string
	>(
		modal: ModalComponent<Props, Exports, Bindings>,
		options?: ModalOpenOptions<Props>
	) => void;
	pop: () => void;
	canPop: () => boolean;
	dequeue: () => void;
}
