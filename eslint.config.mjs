import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{
		ignores: ['dist/**', 'node_modules/**', 'src/api/**'],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	prettier,
	{
		languageOptions: {
			ecmaVersion: 'latest',
			globals: {
				...globals.node,
				...globals.es2021,
			},
		},
		plugins: {
			'unused-imports': unusedImports,
		},
		rules: {
			quotes: ['error', 'single', { allowTemplateLiterals: true }],
			semi: ['error', 'always'],
			'no-multi-spaces': ['error'],
			indent: 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
			'@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
			'@typescript-eslint/no-require-imports': 'off',
			'unused-imports/no-unused-vars': [
				'warn',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					argsIgnorePattern: '^_',
				},
			],
		},
	},
);
