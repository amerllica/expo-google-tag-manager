const { defineConfig } = require('eslint/config');
const universe = require('eslint-config-universe/flat/node');

module.exports = defineConfig([{ ignores: ['plugin/build'] }, ...universe]);
