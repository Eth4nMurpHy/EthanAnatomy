import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {git, parseVersion, readVersions, repositoryRoot, syncVersion, versionFiles} from './release-version.mjs';

const run = (command, args) => execFileSync(command, args, {cwd: repositoryRoot, encoding: 'utf8'}).trim();
const installerName = version => `Human Atlas_${version}_x64-setup.exe`;

export function createAssets({version, directory, source, runUrl}) {
  parseVersion(version);
  const installer = installerName(version);
  const checksum = createHash('sha256').update(fs.readFileSync(path.join(directory, installer))).digest('hex');
  fs.writeFileSync(path.join(directory, 'SHA256SUMS'), `${checksum}  ${installer}\n`);
  fs.writeFileSync(path.join(directory, 'BUILD-REPORT.md'), [
    `# Human Atlas ${version} · Windows x64`, '',
    `- Version: ${version}`, `- Source commit: ${source}`, `- Workflow: ${runUrl}`, '',
    'Built after TypeScript, localization, atlas, interaction, version and packaged-client checks passed.',
    'Installer: NSIS, current user, bundled offline anatomy models.',
    'Requires WebView2. A missing runtime is downloaded by the installer.',
    'This build is unsigned; Chinese terminology is an unreviewed draft.', '',
    `SHA256 (${installer}):`, '', '```text', checksum, '```', '',
  ].join('\n'));
  return checksum;
}

export function verifyAssets(version, directory) {
  parseVersion(version);
  const names = [installerName(version), 'SHA256SUMS', 'BUILD-REPORT.md'];
  for (const name of names) assert.ok(fs.statSync(path.join(directory, name)).isFile(), `Release asset missing: ${name}`);
  const actual = createHash('sha256').update(fs.readFileSync(path.join(directory, names[0]))).digest('hex');
  assert.equal(fs.readFileSync(path.join(directory, names[1]), 'utf8').trim(), `${actual}  ${names[0]}`, 'Installer checksum does not match');
  assert.ok(fs.readFileSync(path.join(directory, names[2]), 'utf8').includes(`Version: ${version}`), 'Build report version does not match');
  return names;
}

function publish(version) {
  parseVersion(version);
  const source = process.env.GITHUB_SHA;
  const runId = process.env.GITHUB_RUN_ID;
  const repository = process.env.GITHUB_REPOSITORY;
  const bump = process.env.VERSION_BUMP || 'patch';
  assert.equal(process.env.GITHUB_REF, 'refs/heads/main', 'Only main can publish');
  assert.ok(['push', 'workflow_dispatch'].includes(process.env.GITHUB_EVENT_NAME), 'Only trusted main events can publish');
  assert.match(source, /^[a-f0-9]{40}$/);
  assert.match(runId, /^\d+$/);
  assert.match(repository, /^[\w.-]+\/[\w.-]+$/);
  assert.ok(['patch', 'minor', 'major'].includes(bump));
  const assetsDirectory = path.join(repositoryRoot, 'release-assets');
  const assetNames = verifyAssets(version, assetsDirectory);
  const tag = `v${version}`;
  const summary = message => {
    console.log(message);
    if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, message + '\n');
  };

  git(['fetch', 'origin', 'main', '--tags']);
  const tags = git(['tag', '--list']).split('\n');
  syncVersion(version);
  if (tags.includes(tag)) {
    const message = git(['log', '-1', '--format=%B', tag]).split('\n');
    assert.ok(message.includes(`Release-Run: ${runId}`) && message.includes(`Release-Source: ${source}`) && message.includes(`Release-Bump: ${bump}`), 'Existing tag belongs to another release; refusing to overwrite it');
    for (const name of versionFiles) {
      assert.equal(git(['show', `${tag}:${name}`]).replaceAll('\r', ''), fs.readFileSync(path.join(repositoryRoot, name), 'utf8').trim().replaceAll('\r', ''), `Retry files differ from ${tag}: ${name}`);
    }
  } else {
    if (git(['rev-parse', 'origin/main']) !== source) {
      summary('Main has advanced. This snapshot passed checks but will not be published; the newer main run will publish.');
      return;
    }
    assert.equal(git(['rev-parse', 'HEAD']), source);
    git(['config', 'user.name', 'github-actions[bot]']);
    git(['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
    git(['add', '--', ...versionFiles]);
    git(['commit', '-m', `chore(release): ${tag}`, '-m', `Release-Source: ${source}\nRelease-Run: ${runId}\nRelease-Bump: ${bump}`]);
    git(['tag', '-a', tag, '-m', `Human Atlas ${tag}`]);
    // An atomic, non-force push prevents a version commit without its tag and
    // refuses to replace any main update that arrived while we were building.
    git(['push', '--atomic', 'origin', 'HEAD:refs/heads/main', `refs/tags/${tag}`]);
  }

  const view = spawnSync('gh', ['release', 'view', tag, '--repo', repository, '--json', 'isDraft,url,assets'], {encoding: 'utf8'});
  let release;
  if (view.status === 0) release = JSON.parse(view.stdout);
  else if (!/release not found|HTTP 404/i.test(view.stderr)) throw new Error(view.stderr || 'Unable to inspect release');
  if (release && !release.isDraft) {
    const names = new Set(release.assets.map(asset => asset.name));
    assert.ok(assetNames.every(name => names.has(name)), 'Published release is missing expected assets');
    summary(`Release already complete: ${release.url}`);
    return;
  }
  const notes = path.join(assetsDirectory, 'RELEASE-NOTES.md');
  fs.writeFileSync(notes, [
    `## Windows x64 · ${version}`, '',
    `自动版本发布，源码：${source}。`, '',
    '下载并运行安装包即可安装。模型随包提供，按当前用户安装。',
    '需要 WebView2；缺少运行时时安装程序会联网下载。安装包尚未签名，中文术语为待审校草稿。', '',
    '附件包含安装包、SHA256SUMS 校验文件和 BUILD-REPORT.md 构建记录。', '',
  ].join('\n'));
  if (!release) {
    run('gh', ['release', 'create', tag, '--repo', repository, '--verify-tag', '--draft', '--title', `Human Atlas ${tag}`,
      '--notes-file', notes, '--generate-notes', ...(parseVersion(version)[0] === 0 ? ['--prerelease', '--latest=false'] : ['--latest'])]);
  }
  run('gh', ['release', 'upload', tag, '--repo', repository, ...assetNames.map(name => path.join(assetsDirectory, name)), '--clobber']);
  run('gh', ['release', 'edit', tag, '--repo', repository, '--draft=false']);
  summary(`Published [Human Atlas ${tag}](https://github.com/${repository}/releases/tag/${tag}) with installer, SHA256 and build report.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const version = process.env.RELEASE_VERSION;
  if (process.argv[2] === 'assets') {
    assert.equal(readVersions(), version);
    const directory = path.join(repositoryRoot, 'src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis');
    createAssets({version, directory, source: process.env.GITHUB_SHA,
      runUrl: `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`});
    console.log(`Recorded checksum and build report for ${installerName(version)}`);
  } else if (process.argv[2] === 'publish') publish(version);
  else throw new Error('Usage: node scripts/publish-release.mjs assets | publish');
}
