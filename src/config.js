// Pure helpers: no terminal code here, so they are easy to unit test.

export const FRAMEWORKS = [
  { label: 'React', value: 'react', hint: 'component UI library' },
  { label: 'Vue', value: 'vue', hint: 'progressive framework' },
  { label: 'Svelte', value: 'svelte', hint: 'compiler-based' },
  { label: 'Angular', value: 'angular', hint: 'coming soon', disabled: 'not available yet' },
];

export const FEATURES = [
  { label: 'TypeScript', value: 'typescript', selected: true },
  { label: 'ESLint', value: 'eslint' },
  { label: 'Prettier', value: 'prettier' },
  { label: 'Vitest', value: 'vitest' },
  { label: 'Docker', value: 'docker' },
];

export const DEFAULTS = {
  name: 'my-termkit-app',
  framework: 'react',
  features: ['typescript'],
  replicas: 2,
  git: true,
};

/** Validator used by the name prompt. Returns true or an error message. */
export function validateName(value) {
  if (!value) return 'Project name is required';
  if (!/^[a-z0-9-]+$/.test(value)) return 'Use lowercase letters, numbers and dashes only';
  if (value.length > 40) return 'Keep it under 40 characters';
  return true;
}

/** Turn raw answers into the list of files the scaffolder will write. */
export function buildPlan(answers) {
  const files = [
    { path: 'package.json', size: 420 },
    { path: 'README.md', size: 310 },
    { path: 'src/index.js', size: 190 },
  ];
  if (answers.features.includes('typescript')) files.push({ path: 'tsconfig.json', size: 260 });
  if (answers.features.includes('eslint')) files.push({ path: 'eslint.config.js', size: 180 });
  if (answers.features.includes('prettier')) files.push({ path: '.prettierrc', size: 60 });
  if (answers.features.includes('vitest')) files.push({ path: 'src/index.test.js', size: 150 });
  if (answers.features.includes('docker')) files.push({ path: 'Dockerfile', size: 230 });
  return files;
}

/** Parse a tiny subset of CLI flags: --yes, --name=x, --framework=x, --help */
export function parseArgs(argv) {
  const flags = { yes: false, help: false, name: undefined, framework: undefined };
  for (const arg of argv) {
    if (arg === '--yes' || arg === '-y') flags.yes = true;
    else if (arg === '--help' || arg === '-h') flags.help = true;
    else if (arg.startsWith('--name=')) flags.name = arg.slice(7);
    else if (arg.startsWith('--framework=')) flags.framework = arg.slice(12);
  }
  return flags;
}
