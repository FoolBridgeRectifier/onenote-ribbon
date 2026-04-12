const path = require('path');
const nodeProcess = require('process');

function createStyleElementId(styleSheetFilePath) {
  const normalizedFilePath = path
    .relative(nodeProcess.cwd(), styleSheetFilePath)
    .replace(/\\/g, '/');

  return `jest-css-${normalizedFilePath}`.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function process(styleSheetSourceText, styleSheetFilePath) {
  const styleElementId = createStyleElementId(styleSheetFilePath);

  return {
    code: `
const cssText = ${JSON.stringify(styleSheetSourceText)};
const styleElementId = ${JSON.stringify(styleElementId)};

if (typeof document !== 'undefined') {
  const existingStyleElement = document.querySelector(
    'style[data-jest-css-id="' + styleElementId + '"]'
  );

  if (!existingStyleElement) {
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-jest-css-id', styleElementId);
    styleElement.textContent = cssText;
    document.head.appendChild(styleElement);
  }
}

module.exports = cssText;
`,
  };
}

module.exports = {
  process,
};
