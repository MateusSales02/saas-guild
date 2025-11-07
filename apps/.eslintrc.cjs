module.exports = {
  root: true,
  ignorePatterns: ['dist', 'node_modules', 'data'],
  env: { es2022: true, browser: true, node: true },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  rules: {
    'prettier/prettier': ['error', { endOfLine: 'lf' }],
  },
  overrides: [
    // arquivos .ts puros (ex.: no Nest)
    {
      files: ['apps/api/**/*.{ts,js}'],
      parser: '@typescript-eslint/parser',
      extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
      rules: { 'prettier/prettier': ['error', { endOfLine: 'lf' }] }
    }
  ]
};
