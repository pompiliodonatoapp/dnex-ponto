#!/usr/bin/env node
/** Internal DNEX source distribution. Update in platform-kit only. */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, copyFileSync, unlinkSync, existsSync, lstatSync, realpathSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const SOURCE_REPOSITORY = 'https://github.com/pompiliodonatoapp/dnex-platform-kit';
const SOURCE_PACKAGE = 'packages/dnex-design-system';
const MANIFEST = 'provenance/dnex-ds.json';
const TOOL = 'scripts/ds-snapshot.mjs';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const fail = message => { throw new Error(message); };
const git = (cwd, args, encoding = 'utf8') => execFileSync('git', ['-C', cwd, ...args], { encoding, maxBuffer: 32 * 1024 * 1024 });
const args = process.argv.slice(2);
const command = args.shift();
const options = new Map();
while (args.length) {
  const key = args.shift();
  if (key === '--adopt-current') options.set(key, true);
  else {
    if (!key?.startsWith('--') || !args.length) fail('Expected --option value.');
    options.set(key, args.shift());
  }
}
function safePath(path) {
  return typeof path === 'string' && path.length > 0 && !path.startsWith('/') && !path.includes('\\') && path.split('/').every(part => part && part !== '.' && part !== '..');
}
function safeDestination(root, path) {
  if (!safePath(path)) fail(`Invalid relative path: ${path}`);
  const dest = resolve(root, path);
  // Refuse symlinked ancestors even when the repository path itself is trusted.
  let cursor = dest;
  while (cursor !== root) {
    if (lstatSync(cursor, { throwIfNoEntry: false })?.isSymbolicLink()) fail(`Symlink destination: ${path}`);
    cursor = dirname(cursor);
  }
  return dest;
}
function rootPath(path) {
  const root = realpathSync(resolve(path));
  if (realpathSync(git(root, ['rev-parse', '--show-toplevel']).trim()) !== root) fail('Target/source must be a Git repository root.');
  return root;
}
function listedPaths(root, scope) {
  return git(root, ['ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', scope]).split('\0').filter(path => path && existsSync(safeDestination(root, path)));
}
function sourceFilesOnDisk(root, scope) {
  const outputDirectories = new Set(['node_modules', 'dist', 'dist-showcase', 'dist-ssr', '.vite']);
  const files = [];
  function visit(directory, prefix = '') {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      // These are dependency/build outputs, never part of the source archive.
      if (outputDirectories.has(entry.name) || entry.name.endsWith('.tsbuildinfo') || entry.name === '.DS_Store') continue;
      const path = `${prefix}${entry.name}`;
      const absolute = safeDestination(root, `${scope}/${path}`);
      if (entry.isDirectory()) visit(absolute, `${path}/`);
      else if (entry.isFile()) files.push(path);
      else fail(`Unsupported generated package entry: ${path}`);
    }
  }
  visit(safeDestination(root, scope));
  return files.sort();
}
function cleanPaths(root, paths) {
  if (git(root, ['status', '--porcelain', '--untracked-files=all', '--', ...paths]).trim()) fail('Commit or preserve pending edits in the generated package, manifest and updater before syncing.');
}
function verify(root) {
  const manifest = JSON.parse(readFileSync(safeDestination(root, MANIFEST), 'utf8'));
  if (manifest.schemaVersion !== 1 || manifest.repository !== SOURCE_REPOSITORY || manifest.sourcePath !== SOURCE_PACKAGE || !/^[a-f0-9]{40}$/.test(manifest.revision) || !/^packages\/[a-zA-Z0-9_-]+$/.test(manifest.packagePath)) fail('Invalid snapshot provenance.');
  if (!manifest.files || !Object.keys(manifest.files).length) fail('Empty snapshot.');
  const expectedPaths = Object.keys(manifest.files).sort();
  for (const path of expectedPaths) {
    if (!safePath(path) || !/^[a-f0-9]{64}$/.test(manifest.files[path])) fail(`Invalid manifest entry: ${path}`);
    const file = safeDestination(root, `${manifest.packagePath}/${path}`);
    if (!existsSync(file) || !lstatSync(file).isFile() || sha256(readFileSync(file)) !== manifest.files[path]) fail(`DS source drift: ${path}`);
  }
  const actual = sourceFilesOnDisk(root, manifest.packagePath);
  if (JSON.stringify(actual) !== JSON.stringify(expectedPaths)) fail('DS generated source file list changed. Sync from the kit instead of editing consumer copies.');
  if (sha256(readFileSync(safeDestination(root, TOOL))) !== manifest.updaterSha256) fail('DS updater differs from the pinned source revision.');
  console.log(`Verified ${manifest.name}@${manifest.version}, ${expectedPaths.length} files, source ${manifest.revision}.`);
  return manifest;
}

if (command === 'verify') {
  // Vercel and exported CI build artifacts may omit .git entirely.
  verify(realpathSync(resolve(options.get('--target') || process.cwd())));
} else if (command === 'sync') {
  const source = rootPath(options.get('--source') || process.cwd());
  const target = rootPath(options.get('--target') || fail('--target is required.'));
  if (source === target) fail('Consumer must differ from the source repository.');
  const revision = options.get('--revision');
  if (!/^[a-f0-9]{40}$/.test(revision || '') || git(source, ['rev-parse', `${revision}^{commit}`]).trim() !== revision) fail('Use an existing full, immutable commit SHA.');
  const origin = git(source, ['remote', 'get-url', 'origin']).trim();
  if (!['git@github.com:pompiliodonatoapp/dnex-platform-kit.git', SOURCE_REPOSITORY, `${SOURCE_REPOSITORY}.git`].includes(origin)) fail('Source origin is not the canonical DNEX kit.');
  const packagePath = options.get('--package') || SOURCE_PACKAGE;
  if (!/^packages\/[a-zA-Z0-9_-]+$/.test(packagePath)) fail('Generated package must be a direct child of packages/.');
  safeDestination(target, packagePath);
  cleanPaths(target, [packagePath, MANIFEST, TOOL]);
  let previous;
  if (existsSync(resolve(target, MANIFEST))) {
    previous = verify(target);
    if (previous.packagePath !== packagePath) fail('Changing package path needs a reviewed consumer migration.');
  } else if (listedPaths(target, packagePath).length && !options.has('--adopt-current')) fail('First migration of an existing copy requires --adopt-current.');
  const updater = git(source, ['show', `${revision}:${TOOL}`], 'buffer');
  if (sha256(updater) !== sha256(readFileSync(fileURLToPath(import.meta.url)))) fail('Run the updater from the exact selected revision.');
  const entries = git(source, ['ls-tree', '-r', '-z', revision, '--', SOURCE_PACKAGE]).split('\0').filter(Boolean).map(row => {
    const match = row.match(/^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/);
    if (!match) fail('Only regular tracked files can be distributed.');
    const path = match[3].slice(SOURCE_PACKAGE.length + 1);
    if (!safePath(path) || /(^|\/)(node_modules|dist|dist-showcase|\.env)(\/|$)/.test(path)) fail(`Unsafe archive entry: ${path}`);
    return path;
  }).sort();
  if (!entries.includes('package.json') || !entries.includes('NOTICE.md')) fail('Package manifest and internal distribution notice are required.');
  const archive = git(source, ['archive', '--format=tar', revision, SOURCE_PACKAGE], 'buffer');
  const staging = mkdtempSync(join(tmpdir(), 'dnex-ds-snapshot-'));
  execFileSync('tar', ['-xf', '-', '-C', staging], { input: archive });
  const files = {};
  for (const path of entries) files[path] = sha256(readFileSync(join(staging, SOURCE_PACKAGE, path)));
  const pkg = JSON.parse(readFileSync(join(staging, SOURCE_PACKAGE, 'package.json'), 'utf8'));
  if (pkg.name !== '@dnex/ds' || pkg.private !== true) fail('Only the private @dnex/ds package may be distributed.');
  const managed = previous ? Object.keys(previous.files).map(path => `${packagePath}/${path}`) : listedPaths(target, packagePath);
  for (const old of managed) {
    if (!entries.includes(old.slice(packagePath.length + 1))) unlinkSync(safeDestination(target, old));
  }
  for (const path of entries) {
    const dest = safeDestination(target, `${packagePath}/${path}`);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(join(staging, SOURCE_PACKAGE, path), dest);
  }
  mkdirSync(resolve(target, 'scripts'), { recursive: true });
  writeFileSync(safeDestination(target, TOOL), updater);
  const manifest = { schemaVersion: 1, repository: SOURCE_REPOSITORY, revision, sourcePath: SOURCE_PACKAGE, sourceTree: git(source, ['rev-parse', `${revision}:${SOURCE_PACKAGE}`]).trim(), packagePath, name: pkg.name, version: pkg.version, updaterSha256: sha256(updater), files };
  mkdirSync(resolve(target, 'provenance'), { recursive: true });
  writeFileSync(safeDestination(target, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
  verify(target);
  console.log(`Snapshot synced. Commit the generated package, ${MANIFEST} and ${TOOL}; run verify before each consumer build.`);
} else {
  console.error('Usage: node scripts/ds-snapshot.mjs verify [--target repository]\n       node scripts/ds-snapshot.mjs sync --source kit --revision SHA40 --target consumer [--package packages/dnex-design-system] [--adopt-current]');
  process.exitCode = 2;
}
