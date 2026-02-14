import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json', 'lcov'],
            exclude: [
                'node_modules/',
                'src/test/',
                '**/*.test.ts',
                '**/*.test.tsx',
                '**/*.config.ts',
                '**/types/',
                'src/app/screens/marketing/',
                'temp_modal.txt',
            ],
            thresholds: {
                lines: 40,
                functions: 40,
                branches: 40,
                statements: 40,
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
