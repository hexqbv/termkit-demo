# termkit-demo

A small project scaffolder CLI that shows how to use the
[`termkit-ui`](https://www.npmjs.com/package/termkit-ui) npm package.
It installs `termkit-ui` from npm like any normal user would.

## Run it

Requires Node.js 22 or newer.

```bash
npm install
npm start
```

Use the keyboard:

| Key | Action |
| :--- | :--- |
| Arrow keys | Move in lists, step numbers |
| Space | Toggle an item in the multi-select |
| A | Select / deselect all in the multi-select |
| Enter | Confirm |
| Ctrl+C | Cancel (the terminal is restored cleanly) |

### Non-interactive (CI / scripts)

```bash
npm run start:ci                              # accept all defaults
node src/cli.js --yes --name=my-app --framework=vue
node src/cli.js --help
```

Prompts and the spinner draw on **stderr**, tables and boxes print to **stdout**,
so you can pipe the results without the UI getting in the way:

```bash
node src/cli.js --yes 2>/dev/null | cat    # just the summary
node src/cli.js --yes >/dev/null           # just the progress messages
```

Generated files are written to `demo-output/` (safe to delete).

## What it demonstrates

| termkit-ui feature | Where |
| :--- | :--- |
| `input` with `validate` | project name, `src/cli.js` |
| `select` with hints and a disabled item | framework |
| `multiselect` with initial selection | extras |
| `number` with min / max | replicas |
| `password` (masked, never logged) | API token (only asked in a real terminal) |
| `confirm` | git question |
| `spinner` (`start`, `update`, `succeed`) | creating files |
| `progressBar` | fake dependency install |
| `table` with aligned columns | summary |
| `box` and `divider` | banner and success message |
| `CancelError` / `NonInteractiveError` | handled at the bottom of `src/cli.js` |

## Test it

```bash
npm test
```

`test/demo.test.js` uses `termkit-ui/testing` to drive real prompts with
simulated keystrokes, with no terminal needed:

```js
const term = createTestTerminal();
const promise = select({ message: 'Framework:', items, input: term.stdin, output: term.stderr });
await term.pressArrowDown();
await term.pressEnter();
assert.equal(await promise, 'vue');
```

## Project layout

```
src/config.js      pure helpers (validation, file plan, flag parsing)
src/cli.js         the CLI: prompts, spinner, progress bar, tables, boxes
test/demo.test.js  unit tests and prompt tests using termkit-ui/testing
```
