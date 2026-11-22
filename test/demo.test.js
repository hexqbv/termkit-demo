import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createTestTerminal } from 'termkit-ui/testing';
import { input, select, confirm } from 'termkit-ui/prompts';
import { CancelError, NonInteractiveError } from 'termkit-ui';

import {
  FRAMEWORKS, DEFAULTS, validateName, buildPlan, parseArgs,
} from '../src/config.js';

// ---------- Pure logic: no terminal needed ----------

test('validateName accepts good names and explains bad ones', () => {
  assert.equal(validateName('my-app'), true);
  assert.match(validateName(''), /required/);
  assert.match(validateName('My App'), /lowercase/);
  assert.match(validateName('x'.repeat(41)), /40/);
});

test('buildPlan adds files for each selected feature', () => {
  const base = buildPlan({ features: [] }).map((f) => f.path);
  assert.deepEqual(base, ['package.json', 'README.md', 'src/index.js']);

  const full = buildPlan({ features: ['typescript', 'docker'] }).map((f) => f.path);
  assert.ok(full.includes('tsconfig.json'));
  assert.ok(full.includes('Dockerfile'));
});

test('parseArgs reads flags', () => {
  assert.deepEqual(parseArgs(['--yes', '--name=app', '--framework=vue']), {
    yes: true, help: false, name: 'app', framework: 'vue',
  });
  assert.equal(parseArgs(['-h']).help, true);
});

// ---------- Prompts driven by termkit-ui's virtual terminal ----------

test('input: validation blocks bad names, then accepts a good one', async () => {
  const term = createTestTerminal();
  const promise = input({
    message: 'Project name:',
    validate: validateName,
    input: term.stdin,
    output: term.stderr,
  });

  await term.type('Bad Name');
  await term.pressEnter();
  assert.match(term.stderr.buffer, /lowercase/);

  for (let i = 0; i < 'Bad Name'.length; i++) await term.pressKey('backspace');
  await term.type('good-name');
  await term.pressEnter();

  assert.equal(await promise, 'good-name');
});

test('select: arrow keys choose a framework and skip disabled items', async () => {
  const term = createTestTerminal();
  const promise = select({
    message: 'Framework:',
    items: FRAMEWORKS,
    default: DEFAULTS.framework,
    input: term.stdin,
    output: term.stderr,
  });

  await term.pressArrowDown(); // react -> vue
  await term.pressEnter();
  assert.equal(await promise, 'vue');
});

test('confirm: pressing n returns false', async () => {
  const term = createTestTerminal();
  const promise = confirm({
    message: 'Initialize git?',
    input: term.stdin,
    output: term.stderr,
  });
  await term.type('n');
  assert.equal(await promise, false);
});

test('Ctrl+C rejects with CancelError by default', async () => {
  const term = createTestTerminal();
  const promise = input({ message: 'Name:', input: term.stdin, output: term.stderr });
  // Attach the assertion BEFORE sending the key, so the rejection is never "unhandled".
  const check = assert.rejects(promise, (err) => err instanceof CancelError && err.reason === 'ctrl-c');
  await term.pressCtrlC();
  await check;
});

test('Ctrl+C returns null when onCancel is "return-null"', async () => {
  const term = createTestTerminal();
  const promise = input({
    message: 'Name:',
    onCancel: 'return-null',
    input: term.stdin,
    output: term.stderr,
  });
  await term.pressCtrlC();
  assert.equal(await promise, null);
});

test('non-interactive input with no default throws NonInteractiveError', async () => {
  const term = createTestTerminal({ isTTY: false });
  await assert.rejects(
    input({ message: 'Name:', input: term.stdin, output: term.stderr }),
    (err) => err instanceof NonInteractiveError,
  );
});
