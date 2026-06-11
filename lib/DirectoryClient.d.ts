import { DirectoryEntry, SupportStatus } from './types';
export declare class DirectoryClient {
    private cache;
    fetchAll(): Promise<DirectoryEntry[]>;
    lookup(packageName: string): Promise<DirectoryEntry | null>;
    checkNewArchSupport(packageName: string): Promise<SupportStatus>;
}
//# sourceMappingURL=DirectoryClient.d.ts.map