import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import tsParser from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));

const strictStructurePlugin = {
  rules: {
    'types-only-in-interfaces-file': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Allow type/interface/enum declarations only in interfaces.ts files.',
        },
        schema: [],
      },
      create(context) {
        const currentFilePath = context.filename.replace(/\\/g, '/');
        const isInterfacesFile = currentFilePath.endsWith('/interfaces.ts');

        if (isInterfacesFile) {
          return {};
        }

        const reportDeclaration = (node, declarationName) => {
          context.report({
            node,
            message: `Only interfaces.ts files can declare ${declarationName}.`,
          });
        };

        return {
          TSInterfaceDeclaration(node) {
            reportDeclaration(node, 'interfaces');
          },
          TSTypeAliasDeclaration(node) {
            reportDeclaration(node, 'type aliases');
          },
          TSEnumDeclaration(node) {
            reportDeclaration(node, 'enums');
          },
        };
      },
    },

    'module-consts-only-in-constants-file': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow non-function top-level const declarations outside constants.ts.',
        },
        schema: [],
      },
      create(context) {
        const currentFilePath = context.filename.replace(/\\/g, '/');
        const isConstantsFile = currentFilePath.endsWith('/constants.ts');

        if (isConstantsFile) {
          return {};
        }

        const isFunctionInitializer = (initializerNode) => (
          initializerNode?.type === 'ArrowFunctionExpression'
          || initializerNode?.type === 'FunctionExpression'
        );

        return {
          Program(programNode) {
            for (const topLevelNode of programNode.body) {
              if (topLevelNode.type !== 'VariableDeclaration' || topLevelNode.kind !== 'const') {
                continue;
              }

              for (const declaratorNode of topLevelNode.declarations) {
                if (!isFunctionInitializer(declaratorNode.init)) {
                  context.report({
                    node: declaratorNode,
                    message: 'Top-level const declarations outside constants.ts must initialize with a function.',
                  });
                }
              }
            }
          },
        };
      },
    },

    'strict-file-name': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Require file name to match folder name or be helpers/constants/interfaces.',
        },
        schema: [],
      },
      create(context) {
        const currentFilePath = context.filename;
        const extensionName = path.extname(currentFilePath);

        if (extensionName !== '.ts' && extensionName !== '.tsx') {
          return {};
        }

        const baseNameWithoutExtension = path.basename(currentFilePath, extensionName);
        const parentFolderName = path.basename(path.dirname(currentFilePath));
        const allowedFileNames = new Set(['helpers', 'constants', 'interfaces']);

        if (allowedFileNames.has(baseNameWithoutExtension)) {
          return {};
        }

        return {
          Program(programNode) {
            if (baseNameWithoutExtension !== parentFolderName) {
              context.report({
                node: programNode,
                message: `File name must match parent folder name (${parentFolderName}${extensionName}) or use helpers/constants/interfaces.`,
              });
            }
          },
        };
      },
    },
  },
};

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Base JavaScript rules
  js.configs.recommended,

  // TypeScript rules (base)
  ...tsParser.configs.recommended,

  // TypeScript + React rules
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      import: importPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'strict-structure': strictStructurePlugin,
    },
    languageOptions: {
      parser: tsParser.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        projectService: true,
        tsconfigRootDir: currentDirectoryPath,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        fetch: 'readonly',
        Headers: 'readonly',
        WebSocket: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        FormData: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        Buffer: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
      },
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: true,
        node: true,
      },
      react: {
        version: '18.3',
      },
    },
    rules: {
      // React specific rules
      'react/react-in-jsx-scope': 'off', // Not needed with React 18+
      'react/prop-types': 'off', // Using TypeScript
      'react/jsx-uses-react': 'off', // Not needed with React 18+
      'react/jsx-uses-vars': 'error',
      'react/no-unescaped-entities': 'warn',
      'react/no-unknown-property': 'error',
      'react/self-closing-comp': 'warn',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-target-blank': 'warn',
      'react/jsx-no-undef': 'error',

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // TypeScript specific rules (no type checking required)
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off', // Allow in existing codebase
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',

      // Import strictness
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',

      // General code quality rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': 'off', // Handled by TypeScript
      'no-undef': 'off', // Handled by TypeScript
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
      'no-return-await': 'error',
      'require-await': 'off', // Allow async functions without await (for return type consistency)
      'no-async-promise-executor': 'error',
      'no-promise-executor-return': 'off', // Allow returning from promise executor
      'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1 }],
      'no-trailing-spaces': 'warn',
      'eol-last': 'warn',
      'no-useless-assignment': 'warn',

      // Structural strictness
      'max-lines': ['error', { max: 150, skipBlankLines: false, skipComments: false }],
      'strict-structure/types-only-in-interfaces-file': 'error',
      'strict-structure/module-consts-only-in-constants-file': 'error',
      'strict-structure/strict-file-name': 'error',
    },
  },

  // Script files (Node.js environment)
  {
    files: ['scripts/**/*.{ts,js,mjs}', '*.config.{ts,js,mjs}', '*.mjs'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // Scripts can use console
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  // CommonJS files (.cjs)
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  // Test files
  {
    files: ['**/*.test.{ts,tsx}', '**/__mocks__/**', '**/test-utils/**', '**/tests/**'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  // E2E test files - more lenient
  {
    files: ['**/e2e/**/*.ts', '**/e2e/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  // Non-test files must strictly keep <= 150 lines
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    ignores: ['**/*.test.{ts,tsx,js,jsx}', '**/__mocks__/**', '**/test-utils/**', '**/tests/**'],
    rules: {
      'max-lines': ['error', { max: 150, skipBlankLines: false, skipComments: false }],
    },
  },

  // Email helpers - uses require() for Node.js modules inside functions
  {
    files: ['**/email/helpers.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'main.js',
      '.e2e-vault/**',
      '.worktrees/**',
    ],
  },

  // Prettier compatibility (must be last)
  prettierConfig,
];
