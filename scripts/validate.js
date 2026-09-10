#!/usr/bin/env node
/**
 * Validates the Cordis plugin halves in this repo.
 *
 * Each half is a plain-JavaScript *function body* that returns a Plugin, so it is
 * parsed with new Function() exactly like the dynamic runtime does. Run locally with:
 *
 *   node scripts/validate.js
 */
import fs from 'node:fs';

const FILES = ['plugin/host.js', 'plugin/client.js'];
/** Globals absent from the dynamic Cordis sandbox (warn only — do not fail a build on style). */
const SANDBOX_GLOBALS = [/(^|[^.\w])process\s*\./, /(^|[^.\w])document\s*\./, /(^|[^.\w])window\s*\./, /(^|[^.\w])fetch\s*\(/];

let failed = false;

for (const file of FILES) {
  if (!fs.existsSync(file)) {
    console.log('skip  ' + file + ' (not present)');
    continue;
  }
  const source = fs.readFileSync(file, 'utf8');
  try {
    new Function(source);
    console.log('ok    ' + file + ' (' + Buffer.byteLength(source) + ' bytes)');
  } catch (error) {
    failed = true;
    console.error('FAIL  ' + file + ': ' + error.message);
  }
  for (const pattern of SANDBOX_GLOBALS) {
    if (pattern.test(source)) {
      console.warn('warn  ' + file + ': possible use of a global unavailable in the dynamic Cordis sandbox (process/document/window) — ignore if it sits inside a string or comment');
      break;
    }
  }
}

if (failed) {
  console.error('\nPlugin sources did not parse. Every half must be a plain-JS function body.');
  process.exit(1);
}
console.log('\nAll plugin halves parsed successfully.');
