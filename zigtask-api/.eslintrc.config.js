import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';

export default tseslint.config({
  files: ['**/*.ts'],
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      sourceType: 'module',
    },
  },
  plugins: {
    prettier: prettierPlugin,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
  },
});
