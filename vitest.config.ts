import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
		exclude: ['dist/**', '.svelte-kit/**', 'node_modules/**']
	}
});
