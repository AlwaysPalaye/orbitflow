/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@willtech/eslint-config'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  root: true,
};
