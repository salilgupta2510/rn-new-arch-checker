#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checker_1 = require("./checker");
const Reporter_1 = require("./Reporter");
const VERSION = '0.1.0';
function parseArgs(argv) {
    const opts = {};
    for (let i = 2; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--help' || arg === '-h') {
            opts.help = true;
        }
        else if (arg === '--version' || arg === '-v') {
            opts.version = true;
        }
        else if (arg === '--include-dev') {
            opts.includeDevDeps = true;
        }
        else if (arg === '--json') {
            opts.json = true;
        }
        else if (arg === '--verbose') {
            opts.verbose = true;
        }
        else if (arg === '--path' && argv[i + 1]) {
            opts.packageJsonPath = argv[++i];
        }
    }
    return opts;
}
async function main() {
    const reporter = new Reporter_1.Reporter();
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
        const report = await (0, checker_1.runChecker)(args);
        if (spinner)
            spinner.stop();
        if (args.json) {
            reporter.printJson(report);
            process.exit(0);
        }
        report.packages.forEach((result) => reporter.printResult(result));
        reporter.printSummary(report);
        process.exit(report.unsupported > 0 ? 1 : 0);
    }
    catch (e) {
        if (spinner)
            spinner.stop();
        const message = e instanceof Error ? e.message : String(e);
        reporter.printError(message);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=cli.js.map