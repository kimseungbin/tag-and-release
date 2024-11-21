import { defineConfig } from 'vitest/config'

export default defineConfig({
	build: {
		lib: {
			entry: 'src/main.ts',
			formats: ['es'],
		},
		outDir: 'dist',
		sourcemap: true,
		emptyOutDir: true,
	},
})
