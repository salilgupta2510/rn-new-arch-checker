import fetch from 'node-fetch';
import { DirectoryEntry, SupportStatus } from './types';

const DIRECTORY_URL = 'https://reactnative.directory/api/libraries';
const PAGE_SIZE = 500;

export class DirectoryClient {
  private cache: DirectoryEntry[] | null = null;

  async fetchAll(): Promise<DirectoryEntry[]> {
    if (this.cache) return this.cache;

    try {
      const all: DirectoryEntry[] = [];
      let offset = 0;

      // First request — also tells us total count
      const firstRes = await fetch(`${DIRECTORY_URL}?limit=${PAGE_SIZE}&offset=0`, {
        headers: { Accept: 'application/json' },
      });
      if (!firstRes.ok) throw new Error(`Directory API returned ${firstRes.status}`);

      const firstData = await firstRes.json() as { libraries?: DirectoryEntry[]; total?: number };
      const page0 = firstData.libraries ?? [];
      all.push(...page0);
      const total = firstData.total ?? page0.length;
      offset = PAGE_SIZE;

      // Fetch remaining pages in parallel
      const remaining: Array<Promise<DirectoryEntry[]>> = [];
      while (offset < total) {
        const url = `${DIRECTORY_URL}?limit=${PAGE_SIZE}&offset=${offset}`;
        remaining.push(
          fetch(url, { headers: { Accept: 'application/json' } })
            .then((r) => r.json() as Promise<{ libraries?: DirectoryEntry[] }>)
            .then((d) => d.libraries ?? [])
        );
        offset += PAGE_SIZE;
      }

      const pages = await Promise.all(remaining);
      for (const page of pages) all.push(...page);

      this.cache = all;
      return this.cache;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`[rn-new-arch-checker] Could not reach react-native.directory: ${msg}`);
      this.cache = [];
      return [];
    }
  }

  async lookup(packageName: string): Promise<DirectoryEntry | null> {
    const all = await this.fetchAll();
    return all.find((entry) => entry.npmPkg === packageName) ?? null;
  }

  async checkNewArchSupport(packageName: string): Promise<SupportStatus> {
    const entry = await this.lookup(packageName);
    if (!entry) return 'unknown';

    // newArchitecture lives in entry.github.newArchitecture (API v2)
    // Fall back to top-level entry.newArchitecture for forward compat
    const flag = entry.github?.newArchitecture ?? entry.newArchitecture;
    if (flag === true) return 'supported';
    if (flag === false) return 'unsupported';
    return 'unknown';
  }
}
