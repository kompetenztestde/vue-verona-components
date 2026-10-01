import js from '@eslint/js';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import playwright from 'eslint-plugin-playwright';
import pluginVue from 'eslint-plugin-vue';
import { globalIgnores } from 'eslint/config';

export default defineConfigWithVueTs(
    {
        name: 'app/files-to-lint',
        files: ['**/*.{ts,mts,tsx,vue}'],
    },

    globalIgnores(['dist/**', 'playwright-report/**', 'test-results/**', 'blob-report/**']),

    js.configs.recommended,
    pluginVue.configs['flat/recommended'],
    vueTsConfigs.recommended,

    {
        ...playwright.configs['flat/recommended'],
        files: ['e2e/**/*.ts'],
    },

    {
        name: 'app/rules',
        rules: {
            // Optional props are typed with `?`; `undefined` is the intended default.
            'vue/require-default-prop': 'off',
        },
    },

    // Formatting is Prettier's job (`npm run format`); this turns off the rules that overlap.
    skipFormatting
);
