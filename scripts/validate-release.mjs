import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createAssets, verifyAssets} from './publish-release.mjs';
import {nextVersion, parseVersion, readVersions, releasePlan, repositoryRoot, syncVersion, versionFiles} from './release-version.mjs';

assert.equal(nextVersion('0.1.0'), '0.1.1');
assert.equal(nextVersion('2.9.99', 'minor'), '2.10.0');
assert.equal(nextVersion('2.9.99', 'major'), '3.0.0');
for (const invalid of ['01.2.3', 'v1.2.3', '1.2.3-beta.1', '1.2', '../1.2.3', '1.2.65536']) {
  assert.throws(() => parseVersion(invalid));
}
assert.throws(() => nextVersion('1.2.3', 'unknown'));
assert.throws(() => nextVersion('1.2.65535'));
readVersions();

const temporaryParent = fs.realpathSync(os.tmpdir());
const root = fs.mkdtempSync(path.join(temporaryParent, 'human-atlas-release-'));
const git = args => execFileSync('git', args, {cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim();
try {
  for (const file of versionFiles) {
    fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true});
    fs.copyFileSync(path.join(repositoryRoot, file), path.join(root, file));
  }
  const dependencyLock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  syncVersion('0.1.0', root);
  git(['init', '-b', 'main']);
  git(['config', 'user.name', 'Release validation']);
  git(['config', 'user.email', 'validation@example.invalid']);
  git(['add', '.']);
  git(['commit', '-m', 'Fixture']);
  const source = git(['rev-parse', 'HEAD']);
  const plan = options => releasePlan({root, enabled: true, source, runId: '100', ...options});
  assert.equal(plan().version, '0.1.1', 'First release increments the source version');
  git(['tag', 'v0.1.9']);
  git(['tag', 'v0.1.10']);
  git(['tag', 'v99.0.0-beta.1']);
  git(['tag', 'unrelated-tag']);
  assert.equal(plan().version, '0.1.11', 'Tags are compared numerically; prerelease/unrelated names are ignored');
  assert.equal(plan({bump: 'minor'}).version, '0.2.0');
  assert.equal(plan({bump: 'major'}).version, '1.0.0');
  assert.equal(plan({bump: 'major'}).prerelease, false);
  assert.equal(plan().prerelease, true);
  assert.deepEqual(plan({enabled: false}), {version: '0.1.0', tag: 'v0.1.0', release: false, prerelease: true}, 'PR checks do not allocate a release');

  syncVersion('0.1.11', root);
  git(['add', '.']);
  git(['commit', '-m', 'Release fixture', '-m', `Release-Run: 100\nRelease-Source: ${source}\nRelease-Bump: patch`]);
  git(['tag', '-a', 'v0.1.11', '-m', 'Fixture release']);
  assert.equal(plan().version, '0.1.11', 'Retry reuses the existing version');
  assert.equal(plan({runId: '101'}).version, '0.1.12', 'A new run advances the version');
  assert.throws(() => plan({source: '0'.repeat(40)}), /Retry source/);
  assert.throws(() => plan({bump: 'major'}), /Retry bump/);

  const updatedLock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  assert.deepEqual(updatedLock.packages[''].dependencies, dependencyLock.packages[''].dependencies);
  assert.deepEqual(updatedLock.packages[''].devDependencies, dependencyLock.packages[''].devDependencies);
  delete updatedLock.packages[''];
  delete dependencyLock.packages[''];
  assert.deepEqual(updatedLock.packages, dependencyLock.packages, 'Version synchronization must not change dependency resolutions');
  assert.equal(readVersions(root), '0.1.11');
  const before = versionFiles.map(file => fs.readFileSync(path.join(root, file), 'utf8'));
  assert.throws(() => syncVersion('invalid', root));
  assert.deepEqual(versionFiles.map(file => fs.readFileSync(path.join(root, file), 'utf8')), before, 'Invalid input must not change version files');
  const configPath = path.join(root, 'src-tauri/tauri.conf.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  config.version = '0.2.0';
  fs.writeFileSync(configPath, JSON.stringify(config));
  assert.throws(() => readVersions(root), /Version files disagree/);

  const installer = path.join(root, 'Human Atlas_0.1.11_x64-setup.exe');
  fs.writeFileSync(installer, 'Fixture installer');
  createAssets({version: '0.1.11', directory: root, source, runUrl: 'https://github.com/example/project/actions/runs/100'});
  assert.equal(verifyAssets('0.1.11', root).length, 3);
  fs.appendFileSync(installer, 'changed');
  assert.throws(() => verifyAssets('0.1.11', root), /checksum does not match/);
} finally {
  // Remove only this test's freshly-created directory inside the resolved temp parent.
  const resolved = fs.realpathSync(root);
  assert.equal(path.dirname(resolved), temporaryParent);
  assert.ok(path.basename(resolved).startsWith('human-atlas-release-'));
  fs.rmSync(resolved, {recursive: true, force: true});
}
console.log('Verified SemVer increments, five synchronized version files, tag ordering, retry reuse, PR isolation and installer checksums.');
