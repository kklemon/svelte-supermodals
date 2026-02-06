# svelte-supermodals

Stack-based and queue-based modal management for Svelte 5.

## Features

- **Stack navigation** — `push` and `pop` modals for multi-step flows, wizards, and confirmations
- **Queue system** — queue modals to display sequentially with a configurable delay between transitions
- **UI-agnostic** — replace the default host with your own design system (shadcn, bits-ui, or anything else)
- **Svelte 5 native** — built on runes, snippets, and the `mount` API
- **TypeScript-first** — fully typed modal components, context, and controller
- **Accessible defaults** — ARIA attributes, focus management, Escape to close, backdrop click dismiss
- **Headless core** — pure TypeScript state machine usable independently of Svelte components

## Installation

```sh
npm install svelte-supermodals
```

## Quick Start

### 1. Add the provider

Wrap your app (or a subtree) with `ModalProvider`:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { ModalProvider } from 'svelte-supermodals';

  let { children } = $props();
</script>

<ModalProvider>
  {@render children()}
</ModalProvider>
```

### 2. Create a modal component

Modal components export `title`, `body`, and `footer` snippets, plus optional `config` and `callbacks`:

```svelte
<!-- src/lib/components/ConfirmModal.svelte -->
<script lang="ts">
  import { useModal } from 'svelte-supermodals';
  import type { ModalViewConfig } from 'svelte-supermodals';

  let { message }: { message: string } = $props();

  const modal = useModal();
  const config: ModalViewConfig = { dismissible: true };

  export { title, body, footer, config };
</script>

{#snippet title()}
  Confirm
{/snippet}

{#snippet body()}
  <p>{message}</p>
{/snippet}

{#snippet footer()}
  <button onclick={() => modal.close()}>OK</button>
{/snippet}
```

### 3. Open it

Call `useModal()` from any component inside the provider tree:

```svelte
<script lang="ts">
  import { useModal } from 'svelte-supermodals';
  import ConfirmModal from '$lib/components/ConfirmModal.svelte';

  const modal = useModal();

  const showConfirm = () => {
    modal.open(ConfirmModal, {
      props: { message: 'Are you sure?' }
    });
  };
</script>

<button onclick={showConfirm}>Confirm</button>
```

## Core Concepts

### Modal Stack

A stack holds one or more modal layers. Use `open` to start a new stack and `push`/`pop` to navigate within it:

```ts
const modal = useModal();

// Open a root modal
modal.open(StepOne, { props: { /* ... */ } });

// Push another modal on top (e.g. a sub-step)
modal.push(StepTwo);

// Go back
if (modal.canPop()) modal.pop();

// Close the entire stack
modal.close();
```

### Modal Queue

Queue additional stacks that display one after another, with a brief delay between them:

```ts
// Opens immediately (nothing is active)
modal.open(WelcomeModal);

// Queued — shows after the welcome modal closes
modal.enqueue(FeedbackModal);

// Close current and advance to next queued modal
modal.dequeue();
```

The delay between queued modals defaults to `150ms` and is configurable via the `queueDelayMs` prop on `ModalProvider`.

### Modal Component Contract

A modal component can export any combination of:

| Export      | Type                | Purpose                        |
|-------------|---------------------|--------------------------------|
| `title`     | `Snippet`           | Rendered in the header area    |
| `body`      | `Snippet`           | Main content                   |
| `footer`    | `Snippet`           | Actions / buttons              |
| `config`    | `ModalViewConfig`   | Host behavior hints            |
| `callbacks` | `ModalCallbacks`    | Keyboard event handlers        |

## API Reference

### `ModalProvider`

| Prop                   | Type                      | Default      | Description                                    |
|------------------------|---------------------------|--------------|------------------------------------------------|
| `queueDelayMs`         | `number`                  | `150`        | Delay in ms between queued stack transitions   |
| `submitOnEnterDefault` | `boolean`                 | `false`      | Global default for Enter key submit behavior   |
| `host`                 | `ModalHostComponent`      | `ModalHost`  | Custom host component for rendering            |
| `hostProps`            | `Record<string, unknown>` | `{}`         | Extra props forwarded to the host              |
| `mountTarget`          | `Element \| ShadowRoot`   | —            | DOM target for mounting modal instances        |

### `useModal()`

Returns a `ModalContext` with these methods:

| Method                      | Description                                      |
|-----------------------------|--------------------------------------------------|
| `open(modal, options?)`     | Replace the current stack with a new modal        |
| `push(modal, options?)`     | Push a modal onto the current stack               |
| `pop()`                     | Remove the top modal (if stack depth > 1)         |
| `canPop()`                  | Returns `true` if `pop()` would succeed           |
| `enqueue(modal, options?)`  | Queue a modal to show after the current stack     |
| `dequeue()`                 | Close current stack, open next queued stack       |
| `close()`                   | Alias for `dequeue()`                             |
| `setModalContent(content)`  | Replace the root modal's exported content         |

The `options` parameter accepts `{ props }` to pass props to the modal component.

### `ModalViewConfig`

| Field             | Type                      | Default | Description                                 |
|-------------------|---------------------------|---------|---------------------------------------------|
| `dismissible`     | `boolean`                 | `true`  | Allow backdrop click and Escape to close    |
| `showCloseButton` | `boolean`                 | `true`  | Show the close button in the default host   |
| `submitOnEnter`   | `boolean`                 | —       | Override the provider's Enter key default   |
| `ui`              | `Record<string, unknown>` | —       | Host-specific metadata (e.g. `className`)   |

### `ModalCallbacks`

| Field     | Type                              | Description                      |
|-----------|-----------------------------------|----------------------------------|
| `onEnter` | `(event: KeyboardEvent) => void`  | Called on Enter when enabled      |

## Custom Host

The default `ModalHost` provides a minimal, accessible modal UI. To use your own design system, create a component that accepts `ModalHostProps` and pass it to the provider:

```svelte
<script lang="ts">
  import { ModalProvider } from 'svelte-supermodals';
  import MyCustomHost from './MyCustomHost.svelte';

  let { children } = $props();
</script>

<ModalProvider host={MyCustomHost}>
  {@render children()}
</ModalProvider>
```

Your custom host receives these props:

| Prop             | Type                          | Description                          |
|------------------|-------------------------------|--------------------------------------|
| `open`           | `boolean`                     | Whether the modal is visible         |
| `modal`          | `ModalExports \| null`        | The active modal's exported snippets |
| `onRequestClose` | `() => void`                  | Call to close the modal              |
| `onOpenChange`   | `(open: boolean) => void`     | Called when open state changes        |

## Headless Core

For advanced use cases, the core state machine can be used directly without the Svelte integration layer:

```ts
import { createModalController } from 'svelte-supermodals';

const controller = createModalController({
  onDropStack: (stack) => {
    // clean up disposed items
  }
});

controller.openStack([item]);
controller.push(anotherItem);
controller.subscribe((state) => {
  // state.currentStack, state.queue, state.isOpen
});

controller.destroy();
```

## License

TBD
