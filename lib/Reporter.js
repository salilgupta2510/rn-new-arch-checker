"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reporter = void 0;
const chalk_1 = __importDefault(require("chalk"));
const VERSION = '0.1.0';
class Reporter {
    printHeader() {
        console.log('');
        console.log(chalk_1.default.cyan('╔══════════════════════════════════════════╗'));
        console.log(chalk_1.default.cyan('║') + chalk_1.default.bold('      rn-new-arch-checker v' + VERSION + '        ') + chalk_1.default.cyan('║'));
        console.log(chalk_1.default.cyan('║') + '   React Native New Architecture Audit    ' + chalk_1.default.cyan('║'));
        console.log(chalk_1.default.cyan('╚══════════════════════════════════════════╝'));
        console.log('');
    }
    printResult(result) {
        const icon = result.newArchSupport === 'supported'
            ? chalk_1.default.green('✅')
            : result.newArchSupport === 'unsupported'
                ? chalk_1.default.red('❌')
                : chalk_1.default.yellow('⚠️ ');
        const label = result.newArchSupport === 'supported'
            ? chalk_1.default.green('supported')
            : result.newArchSupport === 'unsupported'
                ? chalk_1.default.red('unsupported')
                : chalk_1.default.yellow('unknown');
        const pkg = chalk_1.default.white(`${result.name}@${result.version}`);
        const note = result.note ? chalk_1.default.gray(` — ${result.note}`) : '';
        console.log(`  ${icon}  ${pkg.padEnd(50)}  ${label}${note}`);
    }
    printSummary(report) {
        const pct = (n) => report.total > 0 ? ` (${Math.round((n / report.total) * 100)}%)` : '';
        console.log('');
        console.log(chalk_1.default.gray('─'.repeat(60)));
        console.log(chalk_1.default.bold(`  Total checked:    ${report.total}`));
        console.log(chalk_1.default.green(`  ✅ Supported:    ${String(report.supported).padStart(3)}${pct(report.supported)}`));
        console.log(chalk_1.default.red(`  ❌ Unsupported:  ${String(report.unsupported).padStart(3)}${pct(report.unsupported)}`));
        console.log(chalk_1.default.yellow(`  ⚠️  Unknown:      ${String(report.unknown).padStart(3)}${pct(report.unknown)}`));
        console.log(chalk_1.default.gray('─'.repeat(60)));
        const blocking = report.packages.filter((p) => p.newArchSupport === 'unsupported');
        if (blocking.length > 0) {
            console.log('');
            console.log(chalk_1.default.red.bold('  Blocking packages — migrate or replace these first:'));
            blocking.forEach((p) => {
                console.log(chalk_1.default.red(`    • ${p.name}@${p.version}  →  ${p.npmUrl}`));
            });
        }
        console.log('');
    }
    printJson(report) {
        console.log(JSON.stringify(report, null, 2));
    }
    printError(message) {
        console.error(chalk_1.default.red(`\n  Error: ${message}\n`));
    }
    printUsage() {
        console.log(`
${chalk_1.default.bold('rn-new-arch-checker')} — React Native New Architecture Compatibility Audit

${chalk_1.default.bold('Usage:')}
  npx rn-new-arch-checker [options]

${chalk_1.default.bold('Options:')}
  --path <path>    Path to package.json (default: auto-detect from cwd)
  --include-dev    Include devDependencies in the audit
  --json           Output results as JSON (useful for CI pipelines)
  --verbose        Show additional details for each package
  --version        Print version number
  --help           Show this help message

${chalk_1.default.bold('Examples:')}
  npx rn-new-arch-checker
  npx rn-new-arch-checker --path ./apps/mobile/package.json
  npx rn-new-arch-checker --include-dev --json
`);
    }
}
exports.Reporter = Reporter;
//# sourceMappingURL=Reporter.js.map