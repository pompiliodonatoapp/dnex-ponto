/** Immutable source snapshots of the canonical DNEX shell and its contracts. */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, lstatSync, unlinkSync, realpathSync } from 'node:fs';
import { resolve, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPOSITORY = 'https://github.com/pompiliodonatoapp/dnex-platform-kit';
export const PACKAGES = { 'packages/dnex-workspace-shell': '@dnex/workspace-shell', 'packages/dnex-contracts': '@dnex/contracts' };
const MANIFEST = 'provenance/workspace-shell.json';
const SHA = /^[a-f0-9]{40}$/;
const HASH = /^[a-f0-9]{64}$/;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const fail = message => { throw new Error(message); };
const safe = path => typeof path === 'string' && path.length > 0 && !/[\\:\x00-\x1f<>"|?*]/.test(path) && !path.startsWith('/') && path.split('/').every(p => p && p !== '.' && p !== '..' && !/[. ]$/.test(p) && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p));
const uniquePaths = paths => {
  const lower = paths.map(path => path.toLowerCase());
  if (new Set(lower).size !== paths.length) fail('Case-insensitive path collision.');
};
const git = (root, args, encoding = 'utf8') => execFileSync('git', ['-c', `safe.directory=${root.replaceAll('\\', '/')}`, '-C', root, ...args], { encoding, maxBuffer: 24 * 1024 * 1024 });

function destination(root, path) {
  if (!safe(path)) fail(`Invalid path: ${path}`);
  const target = resolve(root, path);
  const rel = relative(root, target);
  if (rel.startsWith(`..${sep}`) || rel === '..') fail('Path escapes repository.');
  for (let cursor = target; cursor !== root; cursor = dirname(cursor)) {
    if (lstatSync(cursor, { throwIfNoEntry: false })?.isSymbolicLink()) fail(`Symlink destination: ${path}`);
  }
  return target;
}

function filesOnDisk(root, scope) {
  const files = [];
  function visit(folder, prefix) {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      // Exact output directories only; all other source additions must be declared.
      if (prefix === '' && ((entry.isDirectory() && ['node_modules', 'dist', '.artifacts'].includes(entry.name)) || (entry.isFile() && ['tsconfig.build.tsbuildinfo', 'tsconfig.tests.tsbuildinfo'].includes(entry.name)))) continue;
      const path = `${prefix}${entry.name}`;
      const absolute = destination(root, `${scope}/${path}`);
      if (entry.isDirectory()) visit(absolute, `${path}/`);
      else if (entry.isFile()) files.push(path);
      else fail(`Unsupported file: ${scope}/${path}`);
    }
  }
  visit(destination(root, scope), '');
  return files.sort();
}

export function verifySnapshot(root, { allowCandidate = false } = {}) {
  root = realpathSync(root);
  const manifest = JSON.parse(readFileSync(destination(root, MANIFEST), 'utf8'));
  if (manifest.schemaVersion !== 1 || manifest.repository !== REPOSITORY || !SHA.test(manifest.revision ?? '')) fail('Invalid provenance.');
  if ('candidate' in manifest && manifest.candidate !== true) fail('Invalid candidate provenance.');
  if (manifest.candidate && !allowCandidate) fail('Candidate snapshot is restricted to local QA; use verify --candidate explicitly.');
  if (JSON.stringify(Object.keys(manifest.packages ?? {}).sort()) !== JSON.stringify(Object.keys(PACKAGES).sort())) fail('Invalid package scopes.');
  let count = 0;
  for (const [scope, expectedName] of Object.entries(PACKAGES)) {
    const entry = manifest.packages[scope];
    if (entry.name !== expectedName || !SHA.test(entry.sourceTree ?? '')) fail(`Invalid source metadata: ${scope}`);
    const paths = Object.keys(entry.files ?? {}).sort();
    uniquePaths(paths);
    if (!paths.includes('package.json') || !paths.includes('src/index.ts')) fail(`Incomplete snapshot: ${scope}`);
    for (const path of paths) {
      if (!safe(path) || !HASH.test(entry.files[path])) fail(`Invalid file entry: ${path}`);
      const target = destination(root, `${scope}/${path}`);
      if (!lstatSync(target, { throwIfNoEntry: false })?.isFile() || hash(readFileSync(target)) !== entry.files[path]) fail(`Source drift: ${scope}/${path}`);
    }
    if (JSON.stringify(filesOnDisk(root, scope)) !== JSON.stringify(paths)) fail(`Source file list drift: ${scope}`);
    const pkg = JSON.parse(readFileSync(destination(root, `${scope}/package.json`), 'utf8'));
    if (pkg.name !== expectedName || pkg.private !== true || pkg.version !== entry.version) fail(`Package metadata drift: ${scope}`);
    count += paths.length;
  }
  return { manifest, count };
}

export function syncSnapshot(root, source, revision, adoptCurrent = false, { candidate = false } = {}) {
  root = realpathSync(root);
  source = realpathSync(source);
  if (root === source || !SHA.test(revision ?? '')) fail('Use a separate canonical checkout and full immutable SHA.');
  for (const dir of [root, source]) {
    if (realpathSync(git(dir, ['rev-parse', '--show-toplevel']).trim()) !== dir) fail('Expected repository root.');
  }
  const origin = git(source, ['remote', 'get-url', 'origin']).trim();
  if (![REPOSITORY, `${REPOSITORY}.git`, 'git@github.com:pompiliodonatoapp/dnex-platform-kit.git'].includes(origin)) fail('Source repository is not canonical.');
  if (git(source, ['rev-parse', `${revision}^{commit}`]).trim() !== revision) fail('Invalid revision.');
  // Fetch is separate. Unintegrated commits are local-QA candidates, rejected by default verification.
  if (!candidate) git(source, ['merge-base', '--is-ancestor', revision, 'origin/main']);
  const scopes = Object.keys(PACKAGES);
  if (git(root, ['status', '--porcelain', '--untracked-files=all', '--', ...scopes, MANIFEST]).trim()) fail('Preserve/commit pending snapshot edits before synchronization.');
  const previous = existsSync(destination(root, MANIFEST)) ? verifySnapshot(root, { allowCandidate: true }).manifest : null;
  if (!previous && !adoptCurrent) fail('First adoption requires --adopt-current.');
  // Git status omits ignored files. Inventory ownership before any writes so adoption
  // cannot overwrite a local ignored file that happens to match a new upstream path.
  const managed = {};
  for (const scope of scopes) {
    managed[scope] = previous ? Object.keys(previous.packages[scope].files)
      : git(root, ['ls-files', '-z', '--', scope]).split('\0').filter(Boolean).map(p => p.slice(scope.length + 1));
    uniquePaths(managed[scope]);
    const onDisk = existsSync(destination(root, scope)) ? filesOnDisk(root, scope) : [];
    if (onDisk.some(path => !managed[scope].includes(path))) fail(`Unmanaged local snapshot files: ${scope}`);
  }
  const snapshot = { schemaVersion: 1, repository: REPOSITORY, revision, packages: {} };
  if (candidate) snapshot.candidate = true;
  const writes = [];
  const removes = [];
  // Validate and read every source blob before touching the consumer.
  for (const [scope, name] of Object.entries(PACKAGES)) {
    const entries = git(source, ['ls-tree', '-r', '-z', revision, '--', scope]).split('\0').filter(Boolean).map(row => {
      const match = row.match(/^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/);
      if (!match || !match[3].startsWith(`${scope}/`) || !safe(match[3])) fail('Source archive contains an unsafe entry.');
      const path = match[3].slice(scope.length + 1);
      if (/(^|\/)(node_modules|dist|\.artifacts)(\/|$)/.test(path) || /(^|\/)\.env(?:\.|$)/i.test(path) || /\.(pfx|p12|pem)$/i.test(path)) fail('Source archive contains output or sensitive files.');
      return path;
    }).sort();
    uniquePaths(entries);
    if (!entries.includes('package.json') || !entries.includes('src/index.ts')) fail(`Incomplete upstream package: ${scope}`);
    const files = {};
    let pkg;
    for (const path of entries) {
      const target = destination(root, `${scope}/${path}`);
      const current = lstatSync(target, { throwIfNoEntry: false });
      if (current && !current.isFile()) fail(`Non-file destination: ${scope}/${path}`);
      const bytes = git(source, ['show', `${revision}:${scope}/${path}`], 'buffer');
      if (path === 'package.json') pkg = JSON.parse(bytes.toString('utf8'));
      files[path] = hash(bytes);
      writes.push([target, bytes]);
    }
    if (pkg.name !== name || pkg.private !== true) fail(`Unexpected package: ${scope}`);
    snapshot.packages[scope] = { name, version: pkg.version, sourceTree: git(source, ['rev-parse', `${revision}:${scope}`]).trim(), files };
    const oldPaths = managed[scope];
    for (const path of oldPaths) if (!entries.includes(path)) removes.push(destination(root, `${scope}/${path}`));
  }
  // Only individually verified, previously managed files can be removed; no recursive deletion.
  for (const target of removes) if (existsSync(target)) unlinkSync(target);
  for (const [target, bytes] of writes) { mkdirSync(dirname(target), { recursive: true }); writeFileSync(target, bytes); }
  const manifestPath = destination(root, MANIFEST);
  mkdirSync(dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  return verifySnapshot(root, { allowCandidate: candidate });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const [command, ...args] = process.argv.slice(2);
  const flags = command === 'sync' ? args.slice(2) : args;
  if (flags.some(flag => !['--candidate', ...(command === 'sync' ? ['--adopt-current'] : [])].includes(flag))) fail('Unknown snapshot option.');
  const result = command === 'sync' ? syncSnapshot(root, args[0], args[1], flags.includes('--adopt-current'), { candidate: flags.includes('--candidate') })
    : command === 'verify' ? verifySnapshot(root, { allowCandidate: flags.includes('--candidate') }) : fail('Usage: verify [--candidate] | sync <kit> <SHA40> [--adopt-current] [--candidate]');
  console.log(`Verified ${result.manifest.candidate ? 'LOCAL QA CANDIDATE' : 'canonical'} shell/contracts: ${result.count} source files, kit ${result.manifest.revision}.`);
}
