"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageScanner = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const RN_PREFIXES = ['react-native', '@react-native', '@expo', 'expo-', 'expo'];
const KNOWN_RN_PACKAGES = new Set([
    'react-native-svg',
    'react-native-maps',
    'react-native-screens',
    'react-navigation',
]);
class PackageScanner {
    scan(packageJsonPath, options) {
        var _a;
        const raw = fs.readFileSync(packageJsonPath, 'utf-8');
        const pkg = JSON.parse(raw);
        return this.extractPackages(pkg, (_a = options.includeDevDeps) !== null && _a !== void 0 ? _a : false);
    }
    isReactNativePackage(name) {
        if (KNOWN_RN_PACKAGES.has(name))
            return true;
        return RN_PREFIXES.some((prefix) => name === prefix || name.startsWith(prefix + '-') || name.startsWith(prefix + '/'));
    }
    extractPackages(packageJson, includeDevDeps) {
        var _a, _b;
        const deps = (_a = packageJson['dependencies']) !== null && _a !== void 0 ? _a : {};
        const devDeps = includeDevDeps
            ? (_b = packageJson['devDependencies']) !== null && _b !== void 0 ? _b : {}
            : {};
        const combined = Object.assign(Object.assign({}, deps), devDeps);
        return Object.entries(combined)
            .filter(([name]) => this.isReactNativePackage(name))
            .map(([name, version]) => ({ name, version }));
    }
    findPackageJson(startDir) {
        let dir = startDir;
        while (true) {
            const candidate = path.join(dir, 'package.json');
            if (fs.existsSync(candidate))
                return candidate;
            const parent = path.dirname(dir);
            if (parent === dir)
                throw new Error('No package.json found in directory tree.');
            dir = parent;
        }
    }
}
exports.PackageScanner = PackageScanner;
//# sourceMappingURL=PackageScanner.js.map