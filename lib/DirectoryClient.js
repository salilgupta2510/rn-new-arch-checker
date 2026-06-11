"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectoryClient = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const DIRECTORY_URL = 'https://reactnative.directory/api/libraries';
const PAGE_SIZE = 500;
class DirectoryClient {
    constructor() {
        this.cache = null;
    }
    async fetchAll() {
        var _a, _b;
        if (this.cache)
            return this.cache;
        try {
            const all = [];
            let offset = 0;
            // First request — also tells us total count
            const firstRes = await (0, node_fetch_1.default)(`${DIRECTORY_URL}?limit=${PAGE_SIZE}&offset=0`, {
                headers: { Accept: 'application/json' },
            });
            if (!firstRes.ok)
                throw new Error(`Directory API returned ${firstRes.status}`);
            const firstData = await firstRes.json();
            const page0 = (_a = firstData.libraries) !== null && _a !== void 0 ? _a : [];
            all.push(...page0);
            const total = (_b = firstData.total) !== null && _b !== void 0 ? _b : page0.length;
            offset = PAGE_SIZE;
            // Fetch remaining pages in parallel
            const remaining = [];
            while (offset < total) {
                const url = `${DIRECTORY_URL}?limit=${PAGE_SIZE}&offset=${offset}`;
                remaining.push((0, node_fetch_1.default)(url, { headers: { Accept: 'application/json' } })
                    .then((r) => r.json())
                    .then((d) => { var _a; return (_a = d.libraries) !== null && _a !== void 0 ? _a : []; }));
                offset += PAGE_SIZE;
            }
            const pages = await Promise.all(remaining);
            for (const page of pages)
                all.push(...page);
            this.cache = all;
            return this.cache;
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            console.warn(`[rn-new-arch-checker] Could not reach react-native.directory: ${msg}`);
            this.cache = [];
            return [];
        }
    }
    async lookup(packageName) {
        var _a;
        const all = await this.fetchAll();
        return (_a = all.find((entry) => entry.npmPkg === packageName)) !== null && _a !== void 0 ? _a : null;
    }
    async checkNewArchSupport(packageName) {
        var _a, _b;
        const entry = await this.lookup(packageName);
        if (!entry)
            return 'unknown';
        // newArchitecture lives in entry.github.newArchitecture (API v2)
        // Fall back to top-level entry.newArchitecture for forward compat
        const flag = (_b = (_a = entry.github) === null || _a === void 0 ? void 0 : _a.newArchitecture) !== null && _b !== void 0 ? _b : entry.newArchitecture;
        if (flag === true)
            return 'supported';
        if (flag === false)
            return 'unsupported';
        return 'unknown';
    }
}
exports.DirectoryClient = DirectoryClient;
//# sourceMappingURL=DirectoryClient.js.map