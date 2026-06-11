# rn-new-arch-checker

[![npm version](https://img.shields.io/npm/v/rn-new-arch-checker.svg)](https://www.npmjs.com/package/rn-new-arch-checker)
[![npm downloads](https://img.shields.io/npm/dm/rn-new-arch-checker.svg)](https://www.npmjs.com/package/rn-new-arch-checker)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-brightgreen.svg)](https://nodejs.org)

CLI and programmatic tool that audits your React Native project's dependencies for New Architecture (Fabric + TurboModules) compatibility. Queries [react-native.directory](https://reactnative.directory) in real time — no stale hardcoded lists.

## Background

React Native 0.76 (October 2024) enabled the New Architecture by default. The legacy bridge is still supported but is no longer receiving new features as of mid-2025. If you're migrating — or planning to — the first question is always: *which of my dependencies is going to block me?*

This tool answers that by checking every react-native / expo package in your `package.json` against the community directory, which tracks `newArchitecture` support for ~2,500 packages.

## Usage

No install required:

```bash
npx rn-new-arch-checker
```

Or install globally for repeated use:

```bash
npm install -g rn-new-arch-checker
rn-new-arch-checker --path ./apps/mobile/package.json
```

## Example Output

```
╔══════════════════════════════════════════╗
║      rn-new-arch-checker v0.1.0        ║
║   React Native New Architecture Audit   ║
╚══════════════════════════════════════════╝

  ✅  react-native-reanimated@3.16.0          supported
  ✅  react-native-screens@3.34.0             supported
  ✅  react-native-gesture-handler@2.20.2     supported
  ❌  react-native-mmkv@3.1.0               unsupported
  ⚠️   react-native-camera@4.2.1              unknown
  ⚠️   react-native-vector-icons@10.2.0       unknown

────────────────────────────────────────────────────────────
  Total checked:    6
  ✅ Supported:      3 (50%)
  ❌ Unsupported:    1 (17%)
  ⚠️  Unknown:        2 (33%)
────────────────────────────────────────────────────────────

  Blocking packages — migrate or replace these first:
    • react-native-mmkv@3.1.0  →  https://www.npmjs.com/package/react-native-mmkv
```

Exit code is `1` if any unsupported packages are found. This makes it easy to gate CI on the result.

## Options

| Flag | Description |
|------|-------------|
| `--path <path>` | Path to `package.json`. Defaults to auto-detect by walking up from cwd. |
| `--include-dev` | Also check `devDependencies`. |
| `--json` | Output as JSON — no spinner, no color, machine-readable. |
| `--verbose` | Additional details per package (GitHub URL, npm URL). |
| `--version` | Print version. |
| `--help` | Show this help. |

## What counts as a react-native package

The scanner filters dependencies by package name prefix. Included: `react-native-*`, `@react-native/*`, `@react-native-community/*`, `expo-*`, `@expo/*`, `@unimodules/*`. Pure JS packages (`axios`, `lodash`, etc.) are skipped — they work regardless.

## Reading the results

| Status | Meaning |
|--------|---------|
| `supported` | Package explicitly marks `newArchitecture: true` in react-native.directory |
| `unsupported` | Package explicitly marks `newArchitecture: false` |
| `unknown` | Package not found in the directory, or the flag isn't set |

`unknown` doesn't mean broken. Many packages work fine on New Architecture without being listed in the directory. Cross-reference with the package's own README or GitHub issues.

## CI Integration

```yaml
# .github/workflows/new-arch-audit.yml
name: New Architecture Audit
on: [pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Check New Architecture compatibility
        run: npx rn-new-arch-checker
```

To save the report as an artifact:

```bash
npx rn-new-arch-checker --json > new-arch-report.json
```

## Programmatic API

```typescript
import { runChecker } from 'rn-new-arch-checker';

const report = await runChecker({
  packageJsonPath: './apps/mobile/package.json',
  includeDevDeps: false,
});

console.log(`${report.supported}/${report.total} packages support New Architecture`);

const blocking = report.packages.filter(p => p.newArchSupport === 'unsupported');
blocking.forEach(p => {
  console.log(`${p.name}@${p.version} — ${p.npmUrl}`);
});
```

The `SummaryReport` object:

```typescript
interface SummaryReport {
  total: number;
  supported: number;
  unsupported: number;
  unknown: number;
  packages: Array<{
    name: string;
    version: string;
    newArchSupport: 'supported' | 'unsupported' | 'unknown';
    githubUrl?: string;
    npmUrl: string;
  }>;
  checkedAt: string; // ISO timestamp
}
```

## How the data works

react-native.directory is a community-maintained registry of ~2,500 React Native packages. Each entry has a `newArchitecture` boolean set by maintainers or contributors. This tool fetches the full dataset at runtime (paginated, ~2,500 entries) so you always get current data, not a snapshot baked into the npm package.

The directory is the same source used by the official [react-native.directory](https://reactnative.directory) website.

## Alternatives considered

- Grepping `package.json` for version numbers — doesn't tell you about compatibility
- Checking individual GitHub repos — too slow, no standard format
- Hardcoded compatibility lists — go stale immediately

## License

MIT © Salil Gupta
