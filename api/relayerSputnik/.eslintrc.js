module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    allowImportExportEverywhere: true,
  },
  extends: [
    'airbnb/base',
  ],
  rules: {
    'flowtype/generic-spacing': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'no-console': 'off',
    'function-paren-newline': [
      'error',
      'consistent',
    ],
    'object-curly-newline': [
      'error',
      {
        ObjectExpression: {
          consistent: true,
        },
        ObjectPattern: {
          multiline: true,
        },
        ImportDeclaration: 'always',
        ExportDeclaration: 'always'
    }],
  },
  env: {
    node: true,
  },
};
