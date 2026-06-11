import { PackageResult, SummaryReport } from './types';
export declare class Reporter {
    printHeader(): void;
    printResult(result: PackageResult): void;
    printSummary(report: SummaryReport): void;
    printJson(report: SummaryReport): void;
    printError(message: string): void;
    printUsage(): void;
}
//# sourceMappingURL=Reporter.d.ts.map