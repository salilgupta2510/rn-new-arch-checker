import { PackageInfo, CheckerOptions } from './types';
export declare class PackageScanner {
    scan(packageJsonPath: string, options: CheckerOptions): PackageInfo[];
    isReactNativePackage(name: string): boolean;
    extractPackages(packageJson: Record<string, unknown>, includeDevDeps: boolean): PackageInfo[];
    findPackageJson(startDir: string): string;
}
//# sourceMappingURL=PackageScanner.d.ts.map