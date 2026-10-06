/**
 * Test runner — no external dependencies.
 * Run: node tests/run-tests.js
 */

import { summary } from './test-utils.js';

console.log('\n── Scanner tests ──────────────────────────────────────────');
await import('./scanner.test.js');

console.log('\n── Matcher tests ──────────────────────────────────────────');
await import('./matcher.test.js');

const failures = summary();
if (failures > 0) process.exit(1);
