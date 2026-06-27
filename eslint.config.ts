import { whoj } from '@whoj/eslint-config';
import { createConfigForNuxt } from '@nuxt/eslint-config/flat';

export default createConfigForNuxt({
  dirs: {
    modules: [
      './src'
    ],
    src: [
      './docs',
      './playground'
    ]
  },
  features: {
    nuxt: {
      sortConfigKeys: true
    },
    standalone: false,
    // tooling: true,
    typescript: false
  }
}).prepend( //@ts-ignore
  whoj({
    ignores: [
      '**/fixtures',
      '**/dist/components/',
      '**/package.json',
      '/src/templates/plugin.js',
      '**/_typed-scss.ts',
      '**/*.test.ts',
      'pnpm-workspace.yaml'
    ],

    jsdoc: false,
    jsonc: false,
    markdown: false,
    // customize the stylistic rules
    stylistic: {
      commaDangle: 'never',
      indent: 2,
      quotes: 'single',
      semi: true
    },
    type: 'lib',

    typescript: {
      overrides: {
        '@typescript-eslint/no-unused-vars': 'off',
        'no-template-curly-in-string': 'off',
        'ts/ban-ts-comment': 'off',
        'ts/explicit-function-return-type': ['off'],
        'ts/method-signature-style': 'off',
        'ts/no-empty-object-type': 'off',
        'ts/no-explicit-any': 'off',
        'ts/no-unsafe-function-type': ['off'],
        'ts/no-unused-expressions': 'off',
        'ts/no-unused-vars': 'off',
        'unused-imports/no-unused-vars': 'off'
      }
    }
  }, {
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

      'node/prefer-global/process': 'off',

      'require-await': 'warn',
      'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'style/comma-dangle': ['error', 'never'],
      'style/spaced-comment': 'off'
    }
  }, {
    files: [
      '**/nuxt.config.*'
    ],
    rules: {
      'perfectionist/sort-objects': 'off'
    }
  }).removeRules(
    'no-new-symbol',
    'vue/component-tags-order',
    'perfectionist/sort-arrays'
  )
);
