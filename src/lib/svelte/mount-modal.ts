import { mount, unmount } from 'svelte';
import type { ModalComponent, ModalExports, ModalOpenOptions } from '../core/types.js';

export type MountedModal = {
	exports: ModalExports;
	dispose: () => void;
};

export type MountModalOptions<Props extends Record<string, unknown> = Record<string, unknown>> =
	ModalOpenOptions<Props> & {
		context?: Map<unknown, unknown>;
		target?: Element | ShadowRoot;
	};

const noop = () => undefined;

export const mountModal = <
	Props extends Record<string, unknown> = Record<string, unknown>,
	Exports extends Partial<ModalExports> = ModalExports,
	Bindings extends string = string
>(
	modal: ModalComponent<Props, Exports, Bindings>,
	options: MountModalOptions<Props> = {}
): MountedModal => {
	if (typeof document === 'undefined') {
		throw new Error('Modal components can only be mounted in the browser.');
	}

	const props = (options.props ?? {}) as Props;

	const instance = mount(modal, {
		target: options.target ?? document.body,
		context: options.context,
		props
	});

	return {
		exports: {
			title: instance.title,
			body: instance.body,
			footer: instance.footer,
			config: instance.config,
			callbacks: instance.callbacks
		},
		dispose: () => {
			void unmount(instance).catch(noop);
		}
	};
};
