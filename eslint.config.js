// ESLint configuration
// Note: Using existing ESLint setup to avoid dependency conflicts

export default [
    {
        ignores: ['dist', 'node_modules', 'server', '*.config.js'],
    },
    {
        files: ['**/*.{ts,tsx}'],
        rules: {
            // TypeScript Rules
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            }],

            // Code Quality
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'prefer-const': 'error',
            'no-var': 'error',

            // Complexity Limits (warnings, not errors)
            'complexity': ['warn', 15],
        },
    },
];
