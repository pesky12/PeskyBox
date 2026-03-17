import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

interface Package {
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

interface PackageGridProps {
  packages: Package[];
  listingUrl: string;
}

const typeColor: Record<string, string> = {
  Avatar: "var(--color-flash)",
  World: "var(--color-glow)",
  Any: "var(--color-orchid)",
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95, rotateX: 10 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 14,
      mass: 1,
    },
  },
};

const VccIcon = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2.5a.5.5 0 0 1 .5.5v6.5H17a.5.5 0 0 1 0 1h-6.5V17a.5.5 0 0 1-1 0v-6.5H3a.5.5 0 0 1 0-1h6.5V3a.5.5 0 0 1 .5-.5z" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M3 17a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm3.293-7.707a1 1 0 0 1 1.414 0L9 10.586V3a1 1 0 1 1 2 0v7.586l1.293-1.293a1 1 0 1 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 0-1.414z"
    />
  </svg>
);

function spawnBirdBurst(target: HTMLElement) {
  if (typeof window === "undefined") return;

  const layer = document.createElement("span");
  layer.className = "bird-burst-layer";

  const count = 11;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement("span");
    particle.className = "bird-particle";

    const direction = (Math.PI * 2 * i) / count + (Math.random() * 0.35 - 0.175);
    const distance = 28 + Math.random() * 26;
    const tx = Math.cos(direction) * distance;
    const ty = Math.sin(direction) * distance - 16;
    const rot = (Math.random() * 160 - 80).toFixed(1);
    const dur = (520 + Math.random() * 260).toFixed(0);
    const delay = (Math.random() * 70).toFixed(0);

    particle.style.setProperty("--tx", `${tx.toFixed(1)}px`);
    particle.style.setProperty("--ty", `${ty.toFixed(1)}px`);
    particle.style.setProperty("--rot", `${rot}deg`);
    particle.style.setProperty("--dur", `${dur}ms`);
    particle.style.setProperty("--delay", `${delay}ms`);

    layer.appendChild(particle);
  }

  target.appendChild(layer);
  window.setTimeout(() => {
    layer.remove();
  }, 900);
}

interface PackageModalProps {
  pkg: Package | null;
  listingUrl: string;
  onClose: () => void;
}

function PackageModal({ pkg, listingUrl, onClose }: PackageModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copy");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (pkg && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!pkg && dialog.open) {
      dialog.close();
    }
  }, [pkg]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCopyListingUrl = async () => {
    try {
      await navigator.clipboard.writeText(listingUrl);
      setCopyLabel("Copied!");
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => {
        setCopyLabel("Copy");
      }, 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
      setCopyLabel("Failed");
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => {
        setCopyLabel("Copy");
      }, 2000);
    }
  };

  if (!pkg) return null;

  return (
    <dialog
      id="pkgModal"
      ref={dialogRef}
      className="m-auto fixed inset-0 max-w-[600px] w-[calc(100%-2rem)] rounded-2xl border border-[var(--color-border)] bg-[#0d0714] text-[var(--color-bloom)] p-0 shadow-[0_0_50px_rgba(147,51,234,0.15)] backdrop:bg-[#07000d]/80 backdrop:backdrop-blur-sm overflow-hidden"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onClose={onClose}
      aria-labelledby="pkg-modal-name"
      aria-modal="true"
      role="dialog"
    >
      <div className="px-6 py-6 sm:px-8 sm:py-8 flex flex-col gap-6 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-electric)]/10 via-transparent to-[var(--color-orchid)]/5 pointer-events-none -z-10" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="pkg-modal-name"
              className="text-2xl font-bold text-white m-0 tracking-tight"
            >
              {pkg.displayName}
            </h2>
            <div className="flex items-center gap-3 mt-1.5 opacity-80 border-none m-0">
              <code className="text-sm font-mono text-[var(--color-code)] bg-transparent border-none p-0 inline">
                {pkg.id}
              </code>
              <code className="text-sm font-mono font-bold text-[var(--color-code)] bg-transparent border-none p-0 inline">
                v{pkg.version}
              </code>
            </div>
          </div>
          <button
            type="button"
            className="shrink-0 -mt-2 -mr-2 rounded-lg p-2 text-[var(--color-muted)] hover:text-white transition-colors cursor-pointer border-none bg-transparent"
            aria-label="Close package details"
            onClick={onClose}
          >
            <svg
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <section>
          <h4 className="text-[13px] font-bold text-[var(--color-orchid)] m-0 mb-2">
            Description
          </h4>
          <p className="text-[15px] text-[var(--color-bloom)]/90 leading-relaxed m-0 border-none overflow-wrap-break-word">
            {pkg.description || "No description available."}
          </p>
        </section>

        {pkg.authorName && (
          <section>
            <h4 className="text-[13px] font-bold text-[var(--color-orchid)] m-0 mb-2">
              Author
            </h4>
            <a
              href={pkg.authorUrl ?? "#"}
              target="_blank"
              rel="noopener"
              className="text-[15px] text-[var(--color-glow)] hover:underline no-underline break-all"
            >
              {pkg.authorName}
            </a>
          </section>
        )}

        {pkg.dependencies.length > 0 && (
          <section>
            <h4 className="text-[13px] font-bold text-[var(--color-orchid)] m-0 mb-2">
              Dependencies ({pkg.dependencies.length})
            </h4>
            <ul className="text-[15px] text-[#b4a9c0] list-disc pl-5 m-0 space-y-1 marker:text-[var(--color-muted)] max-h-40 overflow-y-auto">
              {pkg.dependencies.map((dep) => (
                <li key={`${dep.name}:${dep.version}`} className="break-all">
                  <code className="text-[13px] font-mono">{dep.name}</code>{" "}
                </li>
              ))}
            </ul>
          </section>
        )}

        {pkg.keywords.length > 0 && (
          <section>
            <h4 className="text-[13px] font-bold text-[var(--color-orchid)] m-0 mb-2">
              Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {pkg.keywords.slice(0, 10).map((kw) => (
                <span
                  key={kw}
                  className="text-[12px] rounded-full px-3 py-0.5 border border-[var(--color-orchid)]/30 text-[var(--color-orchid)] bg-white/[0.02] break-all max-w-full"
                  title={kw}
                >
                  {kw.length > 20 ? `${kw.slice(0, 20)}...` : kw}
                </span>
              ))}
              {pkg.keywords.length > 10 && (
                <span className="text-[12px] text-[var(--color-muted)] px-1">
                  +{pkg.keywords.length - 10} more
                </span>
              )}
            </div>
          </section>
        )}

        {(pkg.license || pkg.licensesUrl) && (
          <section>
            <h4 className="text-[13px] font-bold text-[var(--color-orchid)] m-0 mb-2">
              License
            </h4>
            <a
              href={pkg.licensesUrl ?? "#"}
              target="_blank"
              rel="noopener"
              className="text-[15px] text-[#b4a9c0] no-underline hover:text-[var(--color-glow)] hover:underline transition-colors"
            >
              {pkg.license ?? "See License"}
            </a>
          </section>
        )}

        {pkg.zipUrl && (
          <section>
            <h4 className="text-[13px] font-bold text-[var(--color-orchid)] m-0 mb-2">
              Download
            </h4>
            <a
              href={pkg.zipUrl}
              download
              className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-[var(--color-surface)]/50 hover:bg-[var(--color-surface)] text-[var(--color-bloom)] hover:text-white text-sm font-semibold px-4 py-2 transition-colors border border-[var(--color-border)] hover:border-[var(--color-orchid)]/50 no-underline shadow-sm"
            >
              <DownloadIcon />
              Direct Download (.zip)
            </a>
          </section>
        )}

        <section>
          <h4 className="text-[13px] font-bold text-[var(--color-orchid)] m-0 mb-2">
            Listing URL
          </h4>
          <div className="flex items-center gap-3">
            <code className="text-sm font-mono text-[var(--color-muted)] truncate flex-1 leading-none py-1 bg-transparent border-none p-0 inline">
              {listingUrl}
            </code>
            <button
              type="button"
              onClick={handleCopyListingUrl}
              className="shrink-0 rounded-lg px-4 py-1.5 text-sm font-medium bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-[var(--color-orchid)]/50 text-[var(--color-bloom)] hover:text-white transition-all cursor-pointer"
            >
              {copyLabel}
            </button>
          </div>
        </section>
      </div>
    </dialog>
  );
}

function renderButton(
  pkg: Package,
  listingUrl: string,
  onSelect: (selected: Package) => void,
) {
  const addUrl = `vcc://vpm/addRepo?url=${encodeURIComponent(listingUrl)}`;
  const tooltipId = `vcc-tooltip-${pkg.id.replace(/[^a-zA-Z0-9]/g, "-")}`;

  return (
    <div className="flex flex-col gap-2 relative">
      <div className="flex items-center gap-2">
        <a
          href={addUrl}
          className="group/add relative flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-[var(--color-electric)]/20 hover:bg-[var(--color-electric)] text-white text-sm font-bold px-5 py-2 transition-all no-underline"
          aria-label={`Open ${pkg.displayName} in VCC`}
          aria-describedby={tooltipId}
          onClick={(event) => {
            event.preventDefault();
            const target = event.currentTarget;
            spawnBirdBurst(target);
            window.setTimeout(() => {
              window.location.href = addUrl;
            }, 160);
          }}
        >
          <VccIcon /> Open in VCC
          <span
            id={tooltipId}
            role="tooltip"
            className="pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/95 px-3 py-1 text-[11px] font-medium text-[var(--color-muted)] opacity-0 translate-y-1 transition-all duration-200 group-hover/add:opacity-100 group-hover/add:translate-y-0 group-focus-visible/add:opacity-100 group-focus-visible/add:translate-y-0"
          >
            Adds this listing to VCC so you can install it there
          </span>
        </a>
        <button
          type="button"
          className="shrink-0 inline-flex items-center justify-center gap-1 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white hover:text-black transition-colors cursor-pointer"
          onClick={() => onSelect(pkg)}
          aria-label={`View details for ${pkg.displayName}`}
        >
          Info
        </button>
      </div>
    </div>
  );
}

export default function PackageGrid({
  packages,
  listingUrl,
}: PackageGridProps) {
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);

  if (!packages || packages.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--color-muted)] rounded-2xl border border-[var(--color-border)]/60 bg-[var(--color-surface)]/30 backdrop-blur-sm">
        <div className="mx-auto mb-4 h-12 w-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)]/40 grid place-items-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="text-[var(--color-muted)]"
          >
            <path
              d="M3 7.5 12 3l9 4.5-9 4.5L3 7.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M3 12l9 4.5 9-4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M3 16.5 12 21l9-4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-lg m-0">No packages available yet.</p>
        <p className="text-sm mt-2 mb-0">
          Packages will appear here once releases are published.
        </p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 [perspective:1000px]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {packages.map((pkg) => (
          <motion.div key={pkg.id} variants={itemVariants} className="h-full">
            <article
              className="package-card flex flex-col h-full rounded-2xl border border-white/10 bg-[var(--color-abyss)]/70 backdrop-blur-xl p-5 shadow-lg transition-all duration-300 hover:border-[var(--color-orchid)]/60 hover:bg-[var(--color-abyss)]/80 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(192,132,252,0.12)] focus-within:border-[var(--color-orchid)]/60 focus-within:bg-[var(--color-abyss)]/80 focus-within:-translate-y-1 focus-within:shadow-[0_8px_30px_rgba(192,132,252,0.12)] group relative overflow-hidden"
              data-package-name={pkg.displayName.toLowerCase()}
              data-package-id={pkg.id.toLowerCase()}
              tabIndex={0}
              onMouseMove={(event) => {
                const bounds = event.currentTarget.getBoundingClientRect();
                event.currentTarget.style.setProperty(
                  "--mouse-x",
                  `${event.clientX - bounds.left}px`,
                );
                event.currentTarget.style.setProperty(
                  "--mouse-y",
                  `${event.clientY - bounds.top}px`,
                );
              }}
              onKeyDown={(event) => {
                // Allow keyboard navigation to trigger the glow effect
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  const card = event.currentTarget;
                  const infoButton = card.querySelector('[aria-label^="View details"]') as HTMLButtonElement;
                  infoButton?.click();
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-electric)]/0 via-[var(--color-orchid)]/0 to-[var(--color-flash)]/0 group-hover:from-[var(--color-electric)]/5 group-hover:to-[var(--color-flash)]/10 group-focus-within:from-[var(--color-electric)]/5 group-focus-within:to-[var(--color-flash)]/10 transition-colors duration-300 pointer-events-none -z-10 rounded-2xl" />
              <div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
                style={{
                  background:
                    "radial-gradient(450px circle at var(--mouse-x) var(--mouse-y), color-mix(in srgb, var(--color-orchid) 18%, transparent), transparent 45%)",
                }}
              />

              <div className="flex-1">
                <div className="flex items-start justify-between gap-3 mb-3 min-w-0">
                  <h3
                    className="text-[1.1rem] font-bold text-white leading-tight m-0 truncate min-w-0 flex-1"
                    title={pkg.displayName}
                  >
                    {pkg.displayName}
                  </h3>
                  <span
                    className="shrink-0 text-[10px] uppercase tracking-wider font-bold rounded px-2 py-0.5"
                    style={{
                      color: typeColor[pkg.type] ?? typeColor.Any,
                      backgroundColor: `color-mix(in srgb, ${typeColor[pkg.type] ?? typeColor.Any} 15%, transparent)`,
                    }}
                  >
                    {pkg.type}
                  </span>
                </div>

                <p className="text-sm text-white/90 mt-0 mb-3 line-clamp-3 leading-relaxed font-medium overflow-hidden">
                  {pkg.description}
                </p>
              </div>

              <div className="flex flex-col justify-end mt-6 pt-5 border-t border-white/10 relative">
                <div className="flex justify-between items-center mb-4 min-w-0">
                  <code
                    className="text-xs font-mono text-white/95 truncate max-w-[70%] min-w-0"
                    title={pkg.id}
                  >
                    {pkg.id}
                  </code>
                  <code className="text-[11px] font-mono font-bold text-[var(--color-orchid)] bg-[var(--color-orchid)]/10 px-1.5 py-0.5 rounded shrink-0">
                    v{pkg.version}
                  </code>
                </div>

                <div className="mt-auto">
                  {renderButton(pkg, listingUrl, setSelectedPkg)}
                </div>
              </div>
            </article>
          </motion.div>

        ))}
      </motion.div>

      <PackageModal
        pkg={selectedPkg}
        listingUrl={listingUrl}
        onClose={() => setSelectedPkg(null)}
      />
    </>
  );
}