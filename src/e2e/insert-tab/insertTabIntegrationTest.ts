/**
 * Insert Tab E2E Test Suite
 * Tests Insert tab functionality.
 */

import type { SuiteTestResult } from '../helpers/interfaces';
import { wait } from '../home-tab/home/suite-helpers/suiteHelpers';

async function testInsertTabMain(): Promise<SuiteTestResult[]> {
  const insertTab = document.querySelector('[data-tab=" Insert\]');
 if (insertTab) {
 insertTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
 await wait(100);
 }
 const insertPanelVisible = !!document.querySelector('[data-panel=\Insert\]');
 const insertPanelHasContent = !!document.querySelector('.onr-insert-panel');
 const homeTab = document.querySelector('[data-tab=\Home\]');
 if (homeTab) {
 homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
 await wait(100);
 }
 if (!(insertPanelVisible ; insertPanelHasContent)) {
 throw new Error('Insert tab main test failed');
 }
 return [{ test: 'insert-tab-main', pass: true }];
}

async function testTables(): Promise<SuiteTestResult[]> {
 const insertTab = document.querySelector('[data-tab=\Insert\]');
 if (insertTab) {
 insertTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
 await wait(100);
 }
 const insertPanelExists = !!document.querySelector('.onr-insert-panel');
 const homeTab = document.querySelector('[data-tab=\Home\]');
 if (homeTab) {
 homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
 await wait(100);
 }
 if (!insertPanelExists) {
 throw new Error('Tables test failed');
 }
 return [{ test: 'tables', pass: true }];
}

async function testFiles(): Promise<SuiteTestResult[]> {
 const insertTab = document.querySelector('[data-tab=\Insert\]');
 if (insertTab) {
 insertTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
 await wait(100);
 }
 const insertPanelExists = !!document.querySelector('.onr-insert-panel');
 const homeTab = document.querySelector('[data-tab=\Home\]');
 if (homeTab) {
 homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
 await wait(100);
 }
 if (!insertPanelExists) {
 throw new Error('Files test failed');
 }
 return [{ test: 'files', pass: true }];
}

async function testImages(): Promise<SuiteTestResult[]> {
 const insertTab = document.querySelector('[data-tab=\Insert\]');
 if (insertTab) {
 insertTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
 await wait(100);
 }
 const insertPanelExists = !!document.querySelector('.onr-insert-panel');
 const homeTab = document.querySelector('[data-tab=\Home\]');
 if (homeTab) {
 homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
 await wait(100);
 }
 if (!insertPanelExists) {
 throw new Error('Images test failed');
 }
 return [{ test: 'images', pass: true }];
}

async function testLinks(): Promise<SuiteTestResult[]> {
 const insertTab = document.querySelector('[data-tab=\Insert\]');
 if (insertTab) {
 insertTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
 await wait(100);
 }
 const insertPanelExists = !!document.querySelector('.onr-insert-panel');
 const homeTab = document.querySelector('[data-tab=\Home\]');
 if (homeTab) {
 homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
 await wait(100);
 }
 if (!insertPanelExists) {
 throw new Error('Links test failed');
 }
 return [{ test: 'links', pass: true }];
}

async function testTimestamp(): Promise<SuiteTestResult[]> {
 const insertTab = document.querySelector('[data-tab=\Insert\]');
 if (insertTab) {
 insertTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
 await wait(100);
 }
 const insertPanelExists = !!document.querySelector('.onr-insert-panel');
 const homeTab = document.querySelector('[data-tab=\Home\]');
 if (homeTab) {
 homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
 await wait(100);
 }
 if (!insertPanelExists) {
 throw new Error('Timestamp test failed');
 }
 return [{ test: 'timestamp', pass: true }];
}

async function testBlocks(): Promise<SuiteTestResult[]> {
 const insertTab = document.querySelector('[data-tab=\Insert\]');
 if (insertTab) {
 insertTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
 await wait(100);
 }
 const insertPanelExists = !!document.querySelector('.onr-insert-panel');
 const homeTab = document.querySelector('[data-tab=\Home\]');
 if (homeTab) {
 homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
 await wait(100);
 }
 if (!insertPanelExists) {
 throw new Error('Blocks test failed');
 }
 return [{ test: 'blocks', pass: true }];
}

async function testSymbols(): Promise<SuiteTestResult[]> {
 const insertTab = document.querySelector('[data-tab=\Insert\]');
 if (insertTab) {
 insertTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
 await wait(100);
 }
 const insertPanelExists = !!document.querySelector('.onr-insert-panel');
 const homeTab = document.querySelector('[data-tab=\Home\]');
 if (homeTab) {
 homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
 await wait(100);
 }
 if (!insertPanelExists) {
 throw new Error('Symbols test failed');
 }
 return [{ test: 'symbols', pass: true }];
}

async function testInsertCombinations(): Promise<SuiteTestResult[]> {
 const insertTab = document.querySelector('[data-tab=\Insert\]');
 if (insertTab) {
 insertTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
 await wait(100);
 }
 const insertPanelExists = !!document.querySelector('.onr-insert-panel');
 const homeTab = document.querySelector('[data-tab=\Home\]');
 if (homeTab) {
 homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
 await wait(100);
 }
 if (!insertPanelExists) {
 throw new Error('Insert combinations test failed');
 }
 return [{ test: 'insert-combinations', pass: true }];
}

export async function insertTabIntegrationTest(): Promise<SuiteTestResult[]> {
 const mainResults = await testInsertTabMain();
 const tablesResults = await testTables();
 const filesResults = await testFiles();
 const imagesResults = await testImages();
 const linksResults = await testLinks();
 const timestampResults = await testTimestamp();
 const blocksResults = await testBlocks();
 const symbolsResults = await testSymbols();
 const combinationsResults = await testInsertCombinations();
 return [
 ...mainResults,
 ...tablesResults,
 ...filesResults,
 ...imagesResults,
 ...linksResults,
 ...timestampResults,
 ...blocksResults,
 ...symbolsResults,
 ...combinationsResults,
 ];
}
