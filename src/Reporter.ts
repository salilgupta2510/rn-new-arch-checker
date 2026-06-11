import chalk from 'chalk';
import { PackageResult, SummaryReport } from './types';

const VERSION = '0.1.0';

export class Reporter {
  printHeader(): void {
    console.log('');
    console.log(chalk.cyan('╔══════════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + chalk.bold('      rn-new-arch-checker v' + VERSION + '        ') + chalk.cyan('║'));
    console.log(chalk.cyan('║') + '   React Native New Architecture Audit    ' + chalk.cyan('║'));
    console.log(chalk.cyan('╚══════════════════════════════════════════╝'));
    console.log('');
  }

  printResult(result: PackageResult): void {
    const icon =
      result.newArchSupport === 'supported'
        ? chalk.green('✅')
        : result.newArchSupport === 'unsupported'
        ? chalk.red('❌')
        : chalk.yellow('⚠️ ');

    const label =
      result.newArchSupport === 'supported'
        ? chalk.green('supported')
        : result.newArchSupport === 'unsupported'
        ? chalk.red('unsupported')
        : chalk.yellow('unknown');

    const pkg = chalk.white(`${result.name}@${result.version}`);
    const note = result.note ? chalk.gray(` — ${result.note}`) : '';
    console.log(`  ${icon}  ${pkg.padEnd(50)}  ${label}${note}`);
  }

  printSummary(report: SummaryReport): void {
    const pct = (n: number) => report.total > 0 ? ` (${Math.round((n / report.total) * 100)}%)` : '';

    console.log('');
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.bold(`  Total checked:    ${report.total}`));
    console.log(chalk.green(`  ✅ Supported:    ${String(report.supported).padStart(3)}${pct(report.supported)}`));
    console.log(chalk.red(`  ❌ Unsupported:  ${String(report.unsupported).padStart(3)}${pct(report.unsupported)}`));
    console.log(chalk.yellow(`  ⚠️  Unknown:      ${String(report.unknown).padStart(3)}${pct(report.unknown)}`));
    console.log(chalk.gray('─'.repeat(60)));

    const blocking = report.packages.filter((p) => p.newArchSupport === 'unsupported');
    if (blocking.length > 0) {
      console.log('');
      console.log(chalk.red.bold('  Blocking packages — migrate or replace these first:'));
      blocking.forEach((p) => {
        console.log(chalk.red(`    • ${p.name}@${p.version}  →  ${p.npmUrl}`));
      });
    }

    console.log('');
  }

  printJson(report: SummaryReport): void {
    console.log(JSON.stringify(report, null, 2));
  }

  printError(message: string): void {
    console.error(chalk.red(`\n  Error: ${message}\n`));
  }

  printUsage(): void {
    console.log(`
${chalk.bold('rn-new-arch-checker')} — React Native New Architecture Compatibility Audit

${chalk.bold('Usage:')}
  npx rn-new-arch-checker [options]

${chalk.bold('Options:')}
  --path <path>    Path to package.json (default: auto-detect from cwd)
  --include-dev    Include devDependencies in the audit
  --json           Output results as JSON (useful for CI pipelines)
  --verbose        Show additional details for each package
  --version        Print version number
  --help           Show this help message

${chalk.bold('Examples:')}
  npx rn-new-arch-checker
  npx rn-new-arch-checker --path ./apps/mobile/package.json
  npx rn-new-arch-checker --include-dev --json
`);
  }
}
