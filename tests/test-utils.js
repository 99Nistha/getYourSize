import assert from 'assert';

export { assert };

let passed = 0;
let failed = 0;

export function test(name, fn) {
  try {
    fn();
    console.log(`  ✓  ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗  ${name}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

export function summary() {
  const total = passed + failed;
  console.log(`\n${total} tests: ${passed} passed, ${failed} failed\n`);
  return failed;
}
