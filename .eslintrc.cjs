// .eslintrc.cjs  – allow unused vars prefixed with _
module.exports = {
  env: { node: true, es2022: true },
  extends: ["eslint:recommended", "plugin:react/recommended"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: ["react"],
  rules: {
    "no-unused-vars": ["warn", { "args": "none", "varsIgnorePattern": "^_" }]
  }
};
