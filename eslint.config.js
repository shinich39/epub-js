import eslint from "@eslint/js";
import globals from "globals";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      }
    },
    rules: {
      ...eslint.configs.recommended.rules,
      "no-unused-vars": "off",
      "prefer-const": "off",
    },
  },
];