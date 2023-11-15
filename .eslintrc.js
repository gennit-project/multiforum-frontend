module.exports = {
    root: true,
    env: {
      node: true,
      browser: true,
    },
    parserOptions: {
      parser: '@typescript-eslint/parser',
      sourceType: 'module',
      ecmaVersion: 2020
    },
    plugins: ['@typescript-eslint', 'vue'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:vue/vue3-recommended',
    ],
    rules: {
      "vue/no-setup-props-destructure": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "vue/v-on-event-hyphenation": "off",
      "vue/require-explicit-emits": "off",
      // ban console.log but allow console.error and console.warn
      "no-console": ["error", { allow: ["error", "warn"] }],
    }
  };
  