const js = require("@eslint/js");
const globals = require("globals");
const sonarjs = require("eslint-plugin-sonarjs");

module.exports = [
  // base ESLint recommended rules
  js.configs.recommended,

  {
    files: ["**/*.js"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },

    plugins: {
      sonarjs,
    },

    rules: {
      /*
       * === CORE SAFETY ===
       */
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-console": "warn",
      eqeqeq: "error",
      curly: "error",

      /*
       * === NODE FRIENDLY ===
       */
      "no-process-exit": "off",

      /*
       * === SONARJS (quality / smells) ===
       */
      "sonarjs/cognitive-complexity": ["warn", 5],
      "sonarjs/no-identical-functions": "error",
      "sonarjs/no-redundant-boolean": "error",
    },
  },
];
