import js from '@eslint/js'
import globals from 'globals'
import { defineConfig } from 'eslint/config'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'

export default defineConfig([
  js.configs.recommended,
  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      globals: globals.node
    },
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      'prettier/prettier': ['error']
    }
  },
  prettierConfig
])
