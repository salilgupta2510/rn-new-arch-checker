#!/usr/bin/env node

import { runChecker } from './checker';
import { Reporter } from './Reporter';
import { CheckerOptions } from './types';

const VERSION = '0.1.0';

function parseArgs(argv: string[]): CheckerOptions & { help?: boolean; version?: boolean } {
  const opts: CheckerOptions & { help?: boolean; version?: boolean } = {};

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      opts.help = true;
    } else if (arg === '--version' || arg === '-v') {
      opts.version = true;
    } else if (arg === '--include-dev') {
      opts.includeDevDeps = true;
    } else if (arg === '--json') {
      opts.json = true;
    } else if (arg === '--verbose') {
      opts.verbose = true;
    } else if (arg === '--path' && argv[i + 1]) {
      opts.packageJsonPath = argv[++i];
    }
  }

  return opts;
}

async function main(): Promise<void> {
  const reporter = new Reporter();
  const args = parseArgs(process.argv);

  if (args.help) {
    reporter.printUsage();
    process.exit(0);
  }

  if (args.version) {
    console.log(`rn-new-arch-checker v${VERSION}`);
    process.exit(0);
  }

  if (!args.json) {
    reporter.printHeader();
  }

  const ora = require('ora');
  const spinner = args.json ? null : ora('Fetching react-native.directory...').start();

  try {
    const report = await runChecker(args);

    if (spinner) spinner.stop();

    if (args.json) {
      reporter.printJson(report);
      process.exit(0);
    }

    report.packages.forEach((result) => reporter.printResult(result));
    reporter.printSummary(report);

    process.exit(report.unsupported > 0 ? 1 : 0);
  } catch (e: unknown) {
    if (spinner) spinner.stop();
    const message = e instanceof Error ? e.message : String(e);
    reporter.printError(message);
    process.exit(1);
  }
}

main();
