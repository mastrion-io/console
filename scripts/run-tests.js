#!/usr/bin/env node
'use strict';
// scripts/run-tests.js — run the repo's *.test.ts files with Node's built-in test runner.
//
// Why this exists (MST-OPS-005, 2026-11-07): the tests are TypeScript and the repo has no
// "type": "module", so `node --experimental-strip-types --test` cannot resolve the relative
// specifiers that tsc, next and the Next.js runtime all resolve fine. This shim compiles src/
// with the repo's own TypeScript, writes the JS into node_modules/.cache/mastrion-tests (out of
// git, out of .next, so a build never sees it), and runs `node --test` on the compiled output.
//
//   node scripts/run-tests.js            compile src/ and run every src/**/*.test.ts
//   node scripts/run-tests.js <filter>   run only tests whose path contains <filter>
//
// Exits non-zero on a compile error or any test failure, so it is safe as a gate step.

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'node_modules', '.cache', 'mastrion-tests');
const tsPath = path.join(root, 'node_modules', 'typescript', 'lib', 'typescript.js');
if (!fs.existsSync(tsPath)) {
  console.error(`run-tests: TypeScript not installed at ${tsPath}; run npm install first.`);
  process.exit(1);
}
const ts = require(tsPath);

const configPath = path.join(root, 'tsconfig.qa.json');
const { config, error } = ts.readConfigFile(configPath, ts.sys.readFile);
if (error) {
  console.error(ts.flattenDiagnosticMessageText(error.messageText, '\n'));
  process.exit(1);
}
const parsed = ts.parseJsonConfigFileContent(config, ts.sys, root);
const srcRoot = path.join(root, 'src');
const files = parsed.fileNames.filter((f) => f.startsWith(srcRoot));

const program = ts.createProgram(files, {
  ...parsed.options,
  noEmit: false,
  outDir,
  rootDir: srcRoot,
  module: ts.ModuleKind.CommonJS,
  moduleResolution: ts.ModuleResolutionKind.Node10,
  jsx: ts.JsxEmit.ReactJSX,
  inlineSourceMap: true,
  sourceMap: false,
  incremental: false,
  declaration: false,
});

const emit = program.emit();
const diagnostics = ts.getPreEmitDiagnostics(program).concat(emit.diagnostics);
if (diagnostics.length > 0) {
  for (const d of diagnostics.slice(0, 40)) {
    const where = d.file
      ? `${path.relative(root, d.file.fileName)}:${d.file.getLineAndCharacterOfPosition(d.start || 0).line + 1}`
      : '';
    console.error(`${where} ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`);
  }
  console.error(`\nrun-tests: ${diagnostics.length} TypeScript diagnostic(s); not running tests.`);
  process.exit(1);
}

const filter = process.argv[2] || '';
const tests = files
  .filter((f) => /\.test\.tsx?$/.test(f))
  .map((f) =>
    path.join(outDir, path.relative(srcRoot, f)).replace(/\.tsx?$/, '.js'),
  )
  .filter((f) => f.includes(filter));

if (tests.length === 0) {
  console.error(`run-tests: no test files matched "${filter}".`);
  process.exit(1);
}

console.log(`run-tests: ${tests.length} file(s)\n`);
const res = spawnSync(process.execPath, ['--test', ...tests], { cwd: root, stdio: 'inherit' });
process.exit(res.status === null ? 1 : res.status);
