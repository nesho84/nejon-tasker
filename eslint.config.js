// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // Same scope as expo's typescript config, which is where the plugin is registered
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Allow the empty `const styles = StyleSheet.create({})` scaffold on every screen
      '@typescript-eslint/no-unused-vars': ['warn', { varsIgnorePattern: '^styles$', args: 'none' }],
    },
  },
]);
