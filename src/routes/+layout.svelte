<script lang="ts">
	import './layout.css';
	import { ModalProvider } from '$lib/index.js';

	const { children } = $props();
</script>

<ModalProvider submitOnEnterDefault={false}>
	{@render children()}
</ModalProvider>
