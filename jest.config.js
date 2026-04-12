/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  setupFilesAfterEnv: ["<rootDir>/src/test-utils/setup.ts"],
  transform: {
    "^.+\\.css$": "<rootDir>/scripts/jest/cssTransform.cjs",
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          module: "commonjs",
          moduleResolution: "node",
          jsx: "react-jsx",
          jsxImportSource: "react",
          strict: true,
          noImplicitAny: true,
          target: "ES2020",
          lib: ["ES2020", "DOM"],
          types: ["node", "jest"],
        },
        diagnostics: false,
      },
    ],
  },
  moduleNameMapper: {
    "^obsidian$": "<rootDir>/src/__mocks__/obsidian.ts",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/__mocks__/**",
    "!src/test-utils/**",
    "!src/main.ts",
    "!src/ribbon/RibbonShell.ts",
    "!src/tabs/draw/**",
    "!src/tabs/history/**",
    "!src/tabs/review/**",
    "!src/tabs/view/**",
    "!src/tabs/help/**",
    "!src/**/*.integration.ts",
    "!src/**/*.combinations.ts",
  ],
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
};
