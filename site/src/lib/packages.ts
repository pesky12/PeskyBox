export const typeColor: Record<string, string> = {
  Avatar: "var(--color-flash)",
  World: "var(--color-package-meta)",
  Any: "var(--color-orchid)",
};

export interface Package {
  id: string;
  displayName: string;
  description: string;
  version: string;
  type: string;
  authorName?: string;
  authorUrl?: string;
  zipUrl?: string;
  license?: string;
  licensesUrl?: string;
  keywords: string[];
  dependencies: { name: string; version: string }[];
}

interface PackageManifest {
  name: string;
  displayName?: string;
  description?: string;
  version: string;
  author?: { name?: string; url?: string };
  url?: string;
  license?: string;
  licensesUrl?: string;
  keywords?: string[];
  vpmDependencies?: Record<string, string>;
}

type ListingPackages = Record<
  string,
  { versions: Record<string, PackageManifest> }
>;

/** Compares two prerelease identifier lists per semver 2.0 (numeric < alphanumeric). */
function comparePrerelease(a: string[], b: string[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] === undefined) return -1;
    if (b[i] === undefined) return 1;
    const aNum = /^\d+$/.test(a[i]);
    const bNum = /^\d+$/.test(b[i]);
    if (aNum && bNum) {
      if (Number(a[i]) !== Number(b[i])) return Number(a[i]) - Number(b[i]);
    } else if (aNum !== bNum) {
      return aNum ? -1 : 1;
    } else if (a[i] !== b[i]) {
      return a[i] < b[i] ? -1 : 1;
    }
  }
  return 0;
}

/** Sort comparator that puts the highest semver version first. */
function semverCompare(a: string, b: string): number {
  const [coreA, preA] = a.split("+")[0].split(/-(.*)/s);
  const [coreB, preB] = b.split("+")[0].split(/-(.*)/s);
  const numsA = coreA.split(".").map((n) => Number(n) || 0);
  const numsB = coreB.split(".").map((n) => Number(n) || 0);
  for (let i = 0; i < 3; i++) {
    const diff = (numsB[i] ?? 0) - (numsA[i] ?? 0);
    if (diff !== 0) return diff;
  }
  // A release outranks its own prereleases.
  if (preA === undefined || preB === undefined) {
    return preA === preB ? 0 : preA === undefined ? -1 : 1;
  }
  return comparePrerelease(preB.split("."), preA.split("."));
}

function collectDependencies(manifest: PackageManifest) {
  const deps: { name: string; version: string }[] = [];
  if (manifest.vpmDependencies && typeof manifest.vpmDependencies === "object") {
    for (const [name, version] of Object.entries(manifest.vpmDependencies)) {
      if (typeof version === "string") deps.push({ name, version });
    }
  }
  return deps;
}

function classify(deps: { name: string }[]) {
  if (deps.some((d) => d.name.includes("avatars"))) return "Avatar";
  if (deps.some((d) => d.name.includes("worlds"))) return "World";
  return "Any";
}

export function processListing(raw: ListingPackages): Package[] {
  const packages: Package[] = [];

  for (const [id, entry] of Object.entries(raw)) {
    try {
      const versionKeys = Object.keys(entry?.versions ?? {});
      if (versionKeys.length === 0) {
        console.warn(`No versions found for package ${id}`);
        continue;
      }

      const latest = entry.versions[versionKeys.sort(semverCompare)[0]];
      if (!latest?.version) {
        console.warn(`Could not resolve latest version for ${id}`);
        continue;
      }

      const dependencies = collectDependencies(latest);
      packages.push({
        id,
        displayName: latest.displayName?.trim() || id,
        description: latest.description?.trim() || "",
        version: latest.version,
        type: classify(dependencies),
        authorName: latest.author?.name?.trim(),
        authorUrl: latest.author?.url?.trim(),
        zipUrl: latest.url?.trim(),
        license: latest.license?.trim(),
        licensesUrl: latest.licensesUrl?.trim(),
        keywords: Array.isArray(latest.keywords)
          ? latest.keywords.filter((k): k is string => typeof k === "string")
          : [],
        dependencies,
      });
    } catch (error) {
      console.error(`Error processing package ${id}:`, error);
    }
  }

  return packages;
}
