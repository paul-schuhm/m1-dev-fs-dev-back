const js = require('@eslint/js');
const globals = require('globals');
const sonarjs = require('eslint-plugin-sonarjs');
const stylistic = require('@stylistic/eslint-plugin');

module.exports = [
    // base ESLint recommended rules
    js.configs.recommended,

    {
        files: ['**/*.js'],

        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },

        plugins: {
            sonarjs,
            '@stylistic': stylistic,
        },

        rules: {
            /*
       * === CORE SAFETY ===
       */
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'no-undef': 'error',
            'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
            eqeqeq: 'error',
            curly: 'error',

            /*
       * === NODE FRIENDLY ===
       */
            'no-process-exit': 'off',

            /*
       * === FORMATTING / STYLISTIC ===
       * Règles de formatage corrigées automatiquement par `eslint --fix`
       */
            '@stylistic/indent': ['error', 4], // Force 4 espaces pour l'indentation
            '@stylistic/quotes': ['error', 'single'], // Force les guillemets simples ''
            '@stylistic/semi': ['error', 'always'], // Force le point-virgule en fin de ligne ;
            '@stylistic/comma-dangle': ['error', 'always-multiline'], // Virgule finale sur les objets multilignes
            '@stylistic/no-multiple-empty-lines': ['error', { max: 1 }], // Pas plus d'une ligne vide consécutive

            /*
       * === SONARJS (quality / smells) ===
       */
            'sonarjs/cognitive-complexity': ['warn', 5],
            'sonarjs/no-identical-functions': 'error',
            'sonarjs/no-redundant-boolean': 'error',
        },
    },
];
