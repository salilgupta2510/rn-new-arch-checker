import * as fs from 'fs';
import * as path from 'path';
import { PackageInfo, CheckerOptions } from './types';

const RN_PREFIXES = ['react-native', '@react-native', '@expo', 'expo-', 'expo'];
const KNOWN_RN_PACKAGES = new Set([
  'react-native-svg',
  'react-native-maps',
  'react-native-screens',
  'react-navigation',
]);

export class PackageScanner {
  scan(packageJsonPath: string, options: CheckerOptions): PackageInfo[] {
    const raw = fs.readFileSync(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(raw);
    return this.extractPackages(pkg, options.includeDevDeps ?? false);
  }

  isReactNativePackage(name: string): boolean {
    if (KNOWN_RN_PACKAGES.has(name)) return true;
    return RN_PREFIXES.some(
      (prefix) => name === prefix || name.startsWith(prefix + '-') || name.startsWith(prefix + '/')
    );
  }

  extractPackages(packageJson: Record<string, unknown>, includeDevDeps: boolean): PackageInfo[] {
    const deps: Record<string, string> = (packageJson['dependencies'] as Record<string, string>) ?? {};
    const devDeps: Record<string, string> = includeDevDeps
      ? (packageJson['devDependencies'] as Record<string, string>) ?? {}
      : {};

    const combined = { ...deps, ...devDeps };
    return Object.entries(combined)
      .filter(([name]) => this.isReactNativePackage(name))
      .map(([name, version]) => ({ name, version }));
  }

  findPackageJson(startDir: string): string {
    let dir = startDir;
    while (true) {
      const candidate = path.join(dir, 'package.json');
      if (fs.existsSync(candidate)) return candidate;
      const parent = path.dirname(dir);
      if (parent === dir) throw new Error('No package.json found in directory tree.');
      dir = parent;
    }
  }
}
