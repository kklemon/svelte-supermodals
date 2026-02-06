import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createModalController } from './modal-controller.js';

describe('createModalController', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('openStack replaces active stack and clears queued stacks', () => {
		const dropped: string[][] = [];
		const controller = createModalController<string>({
			onDropStack: (stack) => {
				dropped.push(stack);
			}
		});

		controller.openStack(['root-a']);
		controller.enqueueStack(['queued-a']);
		controller.enqueueStack(['queued-b']);

		controller.openStack(['root-b']);

		expect(controller.getState().currentStack).toEqual(['root-b']);
		expect(controller.getState().queue).toEqual([]);
		expect(controller.getState().isOpen).toBe(true);
		expect(dropped).toEqual([['root-a'], ['queued-a'], ['queued-b']]);
	});

	it('push and pop manage stack depth', () => {
		const dropped: string[][] = [];
		const controller = createModalController<string>({
			onDropStack: (stack) => {
				dropped.push(stack);
			}
		});

		controller.openStack(['step-1']);
		controller.push('step-2');
		controller.push('step-3');

		expect(controller.canPop()).toBe(true);
		expect(controller.getState().currentStack).toEqual(['step-1', 'step-2', 'step-3']);

		controller.pop();
		expect(controller.getState().currentStack).toEqual(['step-1', 'step-2']);

		controller.pop();
		expect(controller.getState().currentStack).toEqual(['step-1']);
		expect(controller.canPop()).toBe(false);

		controller.pop();
		expect(controller.getState().currentStack).toEqual(['step-1']);
		expect(dropped).toEqual([['step-3'], ['step-2']]);
	});

	it('enqueueStack opens immediately when closed and queues while active', () => {
		const controller = createModalController<string>();

		controller.enqueueStack(['first']);
		expect(controller.getState().currentStack).toEqual(['first']);
		expect(controller.getState().queue).toEqual([]);

		controller.enqueueStack(['second']);
		controller.enqueueStack(['third']);

		expect(controller.getState().currentStack).toEqual(['first']);
		expect(controller.getState().queue).toEqual([['second'], ['third']]);
	});

	it('close dequeues next stack after delay', () => {
		const dropped: string[][] = [];
		const controller = createModalController<string>({
			queueDelayMs: 100,
			onDropStack: (stack) => {
				dropped.push(stack);
			}
		});

		controller.openStack(['active']);
		controller.enqueueStack(['next']);

		controller.close();
		expect(controller.getState().isOpen).toBe(false);
		expect(controller.getState().currentStack).toEqual([]);
		expect(dropped).toEqual([['active']]);

		vi.advanceTimersByTime(99);
		expect(controller.getState().currentStack).toEqual([]);
		expect(controller.getState().isOpen).toBe(false);

		vi.advanceTimersByTime(1);
		expect(controller.getState().currentStack).toEqual(['next']);
		expect(controller.getState().isOpen).toBe(true);
	});

	it('setModalContent replaces the root modal and keeps stacked children', () => {
		const dropped: string[][] = [];
		const controller = createModalController<string>({
			onDropStack: (stack) => {
				dropped.push(stack);
			}
		});

		controller.openStack(['root']);
		controller.push('child');
		controller.setModalContent('root-replaced');

		expect(controller.getState().currentStack).toEqual(['root-replaced', 'child']);
		expect(dropped).toEqual([['root']]);
	});

	it('dequeue closes when queue is empty', () => {
		const dropped: string[][] = [];
		const controller = createModalController<string>({
			onDropStack: (stack) => {
				dropped.push(stack);
			}
		});

		controller.openStack(['solo']);
		controller.dequeue();

		expect(controller.getState().isOpen).toBe(false);
		expect(controller.getState().currentStack).toEqual([]);
		expect(controller.getState().queue).toEqual([]);
		expect(dropped).toEqual([['solo']]);
	});
});
