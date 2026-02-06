export type ModalControllerState<T> = {
	currentStack: T[];
	queue: T[][];
	isOpen: boolean;
};

export type ModalControllerListener<T> = (state: ModalControllerState<T>) => void;

export type CreateModalControllerOptions<T> = {
	queueDelayMs?: number;
	onDropStack?: (stack: T[]) => void | Promise<void>;
	setTimer?: (callback: () => void, delay: number) => unknown;
	clearTimer?: (handle: unknown) => void;
};

export type ModalController<T> = {
	getState: () => ModalControllerState<T>;
	subscribe: (listener: ModalControllerListener<T>) => () => void;
	setQueueDelayMs: (delay: number) => void;
	openStack: (stack: T[]) => void;
	push: (item: T) => void;
	enqueueStack: (stack: T[]) => void;
	pop: () => void;
	canPop: () => boolean;
	dequeue: () => void;
	close: () => void;
	setModalContent: (item: T) => void;
	destroy: () => void;
};

const isPromiseLike = <T>(value: unknown): value is Promise<T> =>
	typeof value === 'object' && value !== null && 'then' in value;

export const createModalController = <T>(
	options: CreateModalControllerOptions<T> = {}
): ModalController<T> => {
	const {
		queueDelayMs = 150,
		onDropStack,
		setTimer = (callback, delay) => globalThis.setTimeout(callback, delay),
		clearTimer = (handle) => globalThis.clearTimeout(handle as ReturnType<typeof setTimeout>)
	} = options;

	const listeners = new Set<ModalControllerListener<T>>();

	let currentStack: T[] = [];
	let queue: T[][] = [];
	let isOpen = false;

	let queuedTimeout: unknown = null;
	let pendingStack: T[] | null = null;
	let activeQueueDelayMs = Math.max(0, queueDelayMs);

	const getState = (): ModalControllerState<T> => ({
		currentStack: [...currentStack],
		queue: queue.map((stack) => [...stack]),
		isOpen
	});

	const emit = () => {
		const snapshot = getState();
		for (const listener of listeners) {
			listener(snapshot);
		}
	};

	const dropStack = (stack: T[]) => {
		if (stack.length === 0 || !onDropStack) return;

		try {
			const result = onDropStack([...stack]);
			if (isPromiseLike<void>(result)) {
				void result.catch(() => undefined);
			}
		} catch {
			// Intentionally ignore teardown failures to keep controller state consistent.
		}
	};

	const dropStacks = (stacks: T[][]) => {
		for (const stack of stacks) {
			dropStack(stack);
		}
	};

	const clearQueuedTimeout = (dropPending = false) => {
		if (queuedTimeout !== null) {
			clearTimer(queuedTimeout);
			queuedTimeout = null;
		}

		if (dropPending && pendingStack) {
			dropStack(pendingStack);
			pendingStack = null;
		}
	};

	const schedulePendingStack = (stack: T[]) => {
		clearQueuedTimeout(true);
		const delay = activeQueueDelayMs;

		if (delay === 0) {
			currentStack = [...stack];
			isOpen = currentStack.length > 0;
			emit();
			return;
		}

		pendingStack = [...stack];
		currentStack = [];
		isOpen = false;
		emit();

		queuedTimeout = setTimer(() => {
			queuedTimeout = null;
			if (!pendingStack) return;

			currentStack = [...pendingStack];
			pendingStack = null;
			isOpen = currentStack.length > 0;
			emit();
		}, delay);
	};

	const openStack = (stack: T[]) => {
		const droppedStacks = [currentStack, ...queue];
		if (pendingStack) droppedStacks.push(pendingStack);

		clearQueuedTimeout(false);
		pendingStack = null;
		dropStacks(droppedStacks);

		queue = [];
		currentStack = [...stack];
		isOpen = currentStack.length > 0;
		emit();
	};

	const push = (item: T) => {
		clearQueuedTimeout(true);
		currentStack = currentStack.length === 0 ? [item] : [...currentStack, item];
		isOpen = true;
		emit();
	};

	const enqueueStack = (stack: T[]) => {
		if (stack.length === 0) return;

		if (currentStack.length === 0 && pendingStack === null && queuedTimeout === null) {
			currentStack = [...stack];
			isOpen = true;
			emit();
			return;
		}

		queue = [...queue, [...stack]];
		emit();
	};

	const pop = () => {
		if (currentStack.length <= 1) return;

		const removed = currentStack.at(-1);
		if (removed !== undefined) {
			dropStack([removed]);
		}

		currentStack = currentStack.slice(0, -1);
		emit();
	};

	const canPop = () => currentStack.length > 1;

	const dequeue = () => {
		if (queue.length > 0) {
			const [nextStack, ...rest] = queue;
			queue = rest;

			if (currentStack.length === 0) {
				clearQueuedTimeout(true);
				currentStack = [...nextStack];
				isOpen = true;
				emit();
				return;
			}

			dropStack(currentStack);
			schedulePendingStack(nextStack);
			return;
		}

		clearQueuedTimeout(true);
		dropStack(currentStack);
		currentStack = [];
		isOpen = false;
		emit();
	};

	const close = () => {
		dequeue();
	};

	const setModalContent = (item: T) => {
		clearQueuedTimeout(true);

		if (currentStack.length === 0) {
			currentStack = [item];
		} else {
			const removedRoot = currentStack[0];
			dropStack([removedRoot]);
			currentStack = [item, ...currentStack.slice(1)];
		}

		isOpen = true;
		emit();
	};

	const subscribe = (listener: ModalControllerListener<T>) => {
		listeners.add(listener);
		listener(getState());

		return () => {
			listeners.delete(listener);
		};
	};

	const destroy = () => {
		clearQueuedTimeout(true);
		dropStack(currentStack);
		dropStacks(queue);
		currentStack = [];
		queue = [];
		isOpen = false;
		listeners.clear();
	};

	const setQueueDelayMs = (delay: number) => {
		activeQueueDelayMs = Math.max(0, delay);
	};

	return {
		getState,
		subscribe,
		setQueueDelayMs,
		openStack,
		push,
		enqueueStack,
		pop,
		canPop,
		dequeue,
		close,
		setModalContent,
		destroy
	};
};
