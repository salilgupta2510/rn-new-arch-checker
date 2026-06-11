import * as path from 'path';
import { CheckerOptions, PackageResult, SummaryReport } from './types';
import { DirectoryClient } from './DirectoryClient';
import { PackageScanner } from './PackageScanner';

const BATCH_SIZE = 10;

export async function runChecker(options: CheckerOptions = {}): Promise<SummaryReport> {
  const scanner = new PackageScanner();
  const client = new DirectoryClient();

  const packageJsonPath =
    options.packageJsonPath ?? scanner.findPackageJson(process.cwd());

  const packages = scanner.scan(packageJsonPath, options);

  // Pre-fetch directory to avoid per-package rate limiting
  await client.fetchAll();

  const results: PackageResult[] = [];

  for (let i = 0; i < packages.length; i += BATCH_SIZE) {
    const batch = packages.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (pkg) => {
        const newArchSupport = await client.checkNewArchSupport(pkg.name);
        const entry = await client.lookup(pkg.name);
        return {
          name: pkg.name,
          version: pkg.version,
          newArchSupport,
          githubUrl: entry?.github?.urls?.repo,
          npmUrl: `https://www.npmjs.com/package/${pkg.name}`,
        } satisfies PackageResult;
      })
    );
    results.push(...batchResults);
  }

  const supported = results.filter((r) => r.newArchSupport === 'supported').length;
  const unsupported = results.filter((r) => r.newArchSupport === 'unsupported').length;
  const unknown = results.filter((r) => r.newArchSupport === 'unknown').length;

  return {
    total: results.length,
    supported,
    unsupported,
    unknown,
    packages: results,
    checkedAt: new Date().toISOString(),
  };
}
