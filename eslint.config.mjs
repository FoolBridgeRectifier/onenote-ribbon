import path from 'node:path';
import js from '@eslint/js';
import tsParser from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

const strictStructurePlugin = {
  rules: {
    'e2e-test-requires-assertion': {
      meta: {
        type: 'problem',
        docs: {
          description: 'E2E test functions must contain at least one assertion (throw new Error or expect call).',
        },
        schema: [],
      },
      create(context) {
        const currentFilePath = context.filename.replace(/\\/g, '/');
        const isE2eFile = currentFilePath.includes('/e2e/');

        if (!isE2eFile) {
          return {};
        }

        // Check if a function contains an assertion
        function containsAssertion(node) {
          let hasAssertion = false;

          function traverse(currentNode) {
            if (hasAssertion) return;

            if (!currentNode) return;

            // Check for throw new Error (common pattern in this codebase)
            if (
              currentNode.type === 'ThrowStatement'
              && currentNode.argument
              && currentNode.argument.type === 'NewExpression'
              && currentNode.argument.callee
              && currentNode.argument.callee.name === 'Error'
            ) {
              hasAssertion = true;
              return;
            }

            // Check for expect() calls (Jest assertions)
            if (
              currentNode.type === 'CallExpression'
              && currentNode.callee
              && currentNode.callee.name === 'expect'
            ) {
              hasAssertion = true;
              return;
            }

            // Check for assert.* calls (Node.js assertions)
            if (
              currentNode.type === 'CallExpression'
              && currentNode.callee
              && currentNode.callee.type === 'MemberExpression'
              && currentNode.callee.object
              && currentNode.callee.object.name === 'assert'
            ) {
              hasAssertion = true;
              return;
            }

            // Traverse child nodes
            for (const key of Object.keys(currentNode)) {
              if (key === 'parent') continue;
              const child = currentNode[key];
              if (Array.isArray(child)) {
                for (const item of child) {
                  if (item && typeof item === 'object') {
                    traverse(item);
                  }
                }
              } else if (child && typeof child === 'object' && child.type) {
                traverse(child);
              }
            }
          }

          traverse(node);
          return hasAssertion;
        }

        // Check if function is a test function (exported, async, returns SuiteTestResult[])
        function isTestFunction(node) {
          // Check if function is async
          if (!node.async) {
            return false;
          }

          // Check if function name ends with Test or starts with test
          const functionName = node.id?.name || '';
          if (
            !functionName.endsWith('Test')
            && !functionName.endsWith('Tests')
            && !functionName.startsWith('test')
          ) {
            return false;
          }

          return true;
        }

        return {
          FunctionDeclaration(node) {
            if (!isTestFunction(node)) {
              return;
            }

            if (!containsAssertion(node.body)) {
              context.report({
                node,
                message: `E2E test function "${node.id.name}" must contain at least one assertion (throw new Error or expect call).`,
              });
            }
          },

          FunctionExpression(node) {
            if (!isTestFunction(node)) {
              return;
            }

            if (!containsAssertion(node.body)) {
              context.report({
                node,
                message: 'E2E test function must contain at least one assertion (throw new Error or expect call).',
              });
            }
          },

          ArrowFunctionExpression(node) {
            if (!node.async) {
              return;
            }

            // For arrow functions, check if parent is a variable declaration with test-like name
            const parent = node.parent;
            if (
              parent
              && parent.type === 'VariableDeclarator'
              && parent.id
              && parent.id.name
            ) {
              const functionName = parent.id.name;
              if (
                !functionName.endsWith('Test')
                && !functionName.endsWith('Tests')
                && !functionName.startsWith('test')
              ) {
                return;
              }

              if (node.body.type === 'BlockStatement' && !containsAssertion(node.body)) {
                context.report({
                  node,
                  message: `E2E test function "${functionName}" must contain at least one assertion (throw new Error or expect call).`,
                });
              }
            }
          },
        };
      },
    },

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

    'no-double-cast': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow double-casting via "as unknown as T". Use proper types or explicit type guards instead.',
        },
        schema: [],
      },
      create(context) {
        return {
          // Matches: expr as unknown as T  (TSAsExpression whose expression is also a TSAsExpression to unknown)
          TSAsExpression(node) {
            const innerExpression = node.expression;

            if (innerExpression.type !== 'TSAsExpression') {
              return;
            }

            const innerType = innerExpression.typeAnnotation;

            if (
              innerType.type === 'TSUnknownKeyword'
              || (innerType.type === 'TSTypeReference' && innerType.typeName?.name === 'unknown')
            ) {
              context.report({
                node,
                message: 'Double-casting via "as unknown as T" bypasses type safety. Use a proper type or type guard instead.',
              });
            }
          },
        };
      },
    },

    'svg-only-in-assets': {
      meta: {
        type: 'problem',
        docs: {
          description: 'SVG files and SVG component definitions must live only inside src/assets/.',
        },
        schema: [],
      },
      create(context) {
        const currentFilePath = context.filename.replace(/\\/g, '/');
        const isInsideAssetsFolder = currentFilePath.includes('/src/assets/');

        // Allow SVG files and TSX with SVG components inside assets folder
        if (isInsideAssetsFolder) {
          return {};
        }

        // Skip test files - they may contain inline SVG for mocking purposes
        const isTestFile = currentFilePath.endsWith('.test.tsx') || currentFilePath.endsWith('.test.ts');

        if (isTestFile) {
          return {};
        }

        const isSvgFile = currentFilePath.endsWith('.svg');

        // Report SVG files outside assets
        if (isSvgFile) {
          return {
            Program(programNode) {
              context.report({
                node: programNode,
                message: 'SVG files must be placed inside src/assets/.',
              });
            },
          };
        }

        // For TSX files outside assets, check for JSX SVG elements
        const isTsxFile = currentFilePath.endsWith('.tsx');

        if (!isTsxFile) {
          return {};
        }

        return {
          JSXOpeningElement(node) {
            const elementName = node.name?.name;

            // Check for SVG element or common SVG child elements
            const svgElementNames = new Set([
              'svg',
              'rect',
              'circle',
              'ellipse',
              'line',
              'polyline',
              'polygon',
              'path',
              'text',
              'g',
              'defs',
              'use',
              'symbol',
              'linearGradient',
              'radialGradient',
              'stop',
              'clipPath',
              'mask',
              'pattern',
              'image',
              'foreignObject',
            ]);

            if (svgElementNames.has(elementName)) {
              context.report({
                node,
                message: `SVG components (${elementName}) must be defined inside src/assets/. Move this component to the assets folder.`,
              });
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

        // Standard structural files are always allowed regardless of folder
        const structuralFileNames = new Set(['helpers', 'constants', 'interfaces', 'index', 'utils']);
        if (structuralFileNames.has(baseNameWithoutExtension)) {
          return {};
        }

        // Special infrastructure folders where multiple files per folder is intentional
        const specialFolders = new Set(['__mocks__', 'test-utils', 'tests', 'icons', 'context', 'hooks', 'e2e', 'src']);
        if (specialFolders.has(parentFolderName)) {
          return {};
        }

        // Convert kebab-case folder name to PascalCase (e.g. "color-picker" -> "ColorPicker")
        const pascalCaseFolderName = parentFolderName
          .split('-')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join('');

        // Convert kebab-case folder name to camelCase (e.g. "color-picker" -> "colorPicker")
        const camelCaseFolderName = parentFolderName
          .split('-')
          .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
          .join('');

        // Allow .test. files whose base name matches either the kebab-case or PascalCase folder name
        const testFilePattern = /^(.*)\.test$/;
        const testMatch = baseNameWithoutExtension.match(testFilePattern);
        if (testMatch) {
          if (
            testMatch[1] === parentFolderName
            || testMatch[1] === pascalCaseFolderName
            || testMatch[1] === camelCaseFolderName
          ) {
            return {};
          }
        }

        return {
          Program(programNode) {
            const isKebabCaseMatch = baseNameWithoutExtension === parentFolderName;
            const isPascalCaseMatch = baseNameWithoutExtension === pascalCaseFolderName;
            const isCamelCaseMatch = baseNameWithoutExtension === camelCaseFolderName;

            if (!isKebabCaseMatch && !isPascalCaseMatch && !isCamelCaseMatch) {
              context.report({
                node: programNode,
                message: `File name must match parent folder name (${parentFolderName}${extensionName}, ${camelCaseFolderName}${extensionName}, or ${pascalCaseFolderName}${extensionName}) or use helpers/constants/interfaces/utils.`,
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
  ...tsParser.configs.strict,

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
        node: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },
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
      'no-undef': 'off', // TypeScript already catches undefined names via tsc; ESLint's no-undef doesn't understand DOM lib types
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
      'strict-structure/types-only-in-interfaces-file': 'error',
      'strict-structure/module-consts-only-in-constants-file': 'error',
      'strict-structure/strict-file-name': 'error',
      'strict-structure/no-double-cast': 'error',
      'strict-structure/svg-only-in-assets': 'error',
    },
  },

  // Script files (Node.js environment)
  {
    files: ['scripts/**/*.{ts,js,mjs}', '*.config.{ts,js,mjs}', '*.mjs', '*.js'],
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

  // Test files — structural strictness does not apply inside test and mock files
  {
    files: ['**/*.test.{ts,tsx,cjs}', '**/__mocks__/**', '**/test-utils/**', '**/tests/**'],
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
      // Mock/stub files may have empty or constructor-only classes as stubs
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-useless-constructor': 'off',
      // Structural rules do not apply inside test fixtures
      'strict-structure/types-only-in-interfaces-file': 'off',
      'strict-structure/module-consts-only-in-constants-file': 'off',
      'strict-structure/strict-file-name': 'off',
      // Test stubs and mock adapters legitimately use double casts to satisfy interfaces
      'strict-structure/no-double-cast': 'off',
    },
  },

  // E2E test files — structural strictness does not apply to integration test suites
  {
    files: ['**/e2e/**/*.ts', '**/e2e/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      // E2E integration suites can exceed line limits without subfolder splitting
      'max-lines': 'off',
      // Structural rules do not apply inside E2E suites
      'strict-structure/types-only-in-interfaces-file': 'off',
      'strict-structure/module-consts-only-in-constants-file': 'off',
      'strict-structure/strict-file-name': 'off',
      // E2E runtime adapters may use double casts to bridge Obsidian/test types
      'strict-structure/no-double-cast': 'off',
      // E2E tests must contain at least one assertion
      'strict-structure/e2e-test-requires-assertion': 'error',
    },
  },

  // Type declaration files — exempt from file-name structural check
  {
    files: ['**/types/**', '**/*.d.ts'],
    rules: {
      'strict-structure/strict-file-name': 'off',
    },
  },

  // Non-test files must strictly keep <= 150 lines
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    ignores: [
      '**/*.test.{ts,tsx,js,jsx,cjs}',
      '**/__mocks__/**',
      '**/test-utils/**',
      '**/tests/**',
      '**/e2e/**',
      // The ESLint config itself is a single structured file; splitting it would reduce clarity
      'eslint.config.mjs',
    ],
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
