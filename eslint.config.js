// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      // Allow the empty `const styles = StyleSheet.create({})` scaffold on every screen
      '@typescript-eslint/no-unused-vars': ['warn', { varsIgnorePattern: '^styles$', args: 'none' }],
    },
  },
]);
