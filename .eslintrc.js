module.exports = {
  env: {
    // browser: true,
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    "no-unused-vars": [2, { vars: "all", args: "none" }],
  },
};
