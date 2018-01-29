module.exports = {
  env: {
    node: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
  },
};