"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runChecker = runChecker;
const DirectoryClient_1 = require("./DirectoryClient");
const PackageScanner_1 = require("./PackageScanner");
const BATCH_SIZE = 10;
async function runChecker(options = {}) {
    var _a;
    const scanner = new PackageScanner_1.PackageScanner();
    const client = new DirectoryClient_1.DirectoryClient();
    const packageJsonPath = (_a = options.packageJsonPath) !== null && _a !== void 0 ? _a : scanner.findPackageJson(process.cwd());
    const packages = scanner.scan(packageJsonPath, options);
    // Pre-fetch directory to avoid per-package rate limiting
    await client.fetchAll();
    const results = [];
    for (let i = 0; i < packages.length; i += BATCH_SIZE) {
        const batch = packages.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(batch.map(async (pkg) => {
            var _a, _b;
            const newArchSupport = await client.checkNewArchSupport(pkg.name);
            const entry = await client.lookup(pkg.name);
            return {
                name: pkg.name,
                version: pkg.version,
                newArchSupport,
                githubUrl: (_b = (_a = entry === null || entry === void 0 ? void 0 : entry.github) === null || _a === void 0 ? void 0 : _a.urls) === null || _b === void 0 ? void 0 : _b.repo,
                npmUrl: `https://www.npmjs.com/package/${pkg.name}`,
            };
        }));
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
//# sourceMappingURL=checker.js.map