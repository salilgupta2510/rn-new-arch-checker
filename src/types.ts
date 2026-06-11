export type SupportStatus = 'supported' | 'unsupported' | 'unknown';

export interface PackageInfo {
  name: string;
  version: string;
}

export interface PackageResult extends PackageInfo {
  newArchSupport: SupportStatus;
  githubUrl?: string;
  npmUrl: string;
  note?: string;
}

export interface CheckerOptions {
  packageJsonPath?: string;
  includeDevDeps?: boolean;
  json?: boolean;
  verbose?: boolean;
}

export interface DirectoryEntryGithub {
  newArchitecture?: boolean;
  moduleType?: string;
  hasNativeCode?: boolean;
  urls?: { repo?: string; homepage?: string };
  stats?: { stars?: number; downloads?: number };
}

export interface DirectoryEntry {
  npmPkg: string;
  github?: DirectoryEntryGithub;
  newArchitecture?: boolean;
  ios?: boolean;
  android?: boolean;
  npm?: { downloads?: number; weekDownloads?: number; latestRelease?: string };
  score?: number;
}

export interface SummaryReport {
  total: number;
  supported: number;
  unsupported: number;
  unknown: number;
  packages: PackageResult[];
  checkedAt: string;
}
