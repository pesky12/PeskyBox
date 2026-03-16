import React, { useEffect, useRef } from "react";
import type { Package } from "../lib/packages";
import { typeColor } from "../lib/packages";
import { DownloadIcon } from "./icons";
import { useCopy } from "../lib/useCopy";

interface PackageModalProps {
  pkg: Package | null;
  listingUrl: string;
  onClose: () => void;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="font-fragment text-xs uppercase tracking-[0.1em] text-[var(--color-muted)] m-0">
      {children}
    </h4>
  );
}

function PackageModal({ pkg, listingUrl, onClose }: PackageModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const { status: copyStatus, copy: handleCopyListingUrl } = useCopy(listingUrl);
  const copyLabel = { idle: "Copy", copied: "Copied!", failed: "Failed" }[copyStatus];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (pkg && dialog && !dialog.open) dialog.showModal();
  }, [pkg]);

  if (!pkg) return null;

  return (
    <dialog
      id="pkgModal"
      ref={dialogRef}
      className="m-auto fixed inset-0 max-w-[600px] w-[calc(100%-2rem)] card-surface text-white p-0 backdrop:bg-[var(--color-abyss)]/90 overflow-hidden"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onClose={onClose}
      aria-labelledby="pkg-modal-name"
    >
      {/* --- Header strip --- */}
      <div className="relative flex items-center justify-between gap-3 px-6 py-3 bg-white/[0.04] border-b border-white/20">
        <span
          className="font-fragment text-xs uppercase tracking-[0.1em]"
          style={{ color: typeColor[pkg.type] ?? typeColor.Any }}
        >
          {pkg.type}
        </span>
        <div className="flex items-center gap-3">
          <code className="font-fragment text-[13px] text-[var(--color-package-meta)]">
            v{pkg.version}
          </code>
          <button
            type="button"
            className="shrink-0 -mr-1 rounded-lg p-1 text-[var(--color-muted)] hover:text-white transition-colors cursor-pointer border-none bg-transparent"
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* --- Body --- */}
      <div className="flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8 max-h-[70vh] overflow-y-auto">
        <div className="min-w-0">
          <h2
            id="pkg-modal-name"
            className="font-display text-2xl font-medium text-white m-0 leading-[1.15] tracking-[-0.02em] break-words"
          >
            {pkg.displayName}
          </h2>
          <code
            className="block font-fragment text-[9px] text-white/60 mt-1 break-all bg-transparent border-none p-0"
            title={pkg.id}
          >
            {pkg.id}
          </code>
        </div>

        <p className="text-[15px] font-light text-white/85 m-0 leading-relaxed break-words">
          {pkg.description || "No description available."}
        </p>

        {/* --- Author --- */}
        {pkg.authorName && (
          <section className="flex flex-col gap-2">
            <SectionHeading>Author</SectionHeading>
            {pkg.authorUrl ? (
              <a
                href={pkg.authorUrl}
                target="_blank"
                rel="noopener"
                className="text-[15px] text-[var(--color-glow)] underline underline-offset-2 hover:text-[var(--color-orchid)] transition-colors break-all w-fit"
              >
                {pkg.authorName}
              </a>
            ) : (
              <span className="text-[15px] text-white/75 break-all">{pkg.authorName}</span>
            )}
          </section>
        )}

        {/* --- Dependencies --- */}
        {pkg.dependencies.length > 0 && (
          <section className="flex flex-col gap-2">
            <SectionHeading>Dependencies ({pkg.dependencies.length})</SectionHeading>
            <ul className="font-fragment text-[11px] text-white/75 list-disc pl-5 m-0 space-y-1 marker:text-[var(--color-muted)] max-h-40 overflow-y-auto">
              {pkg.dependencies.map((dep) => (
                <li key={dep.name} className="break-all">
                  {dep.name}{" "}
                  <span className="text-[var(--color-muted)]">{dep.version}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* --- Keywords --- */}
        {pkg.keywords.length > 0 && (
          <section className="flex flex-col gap-3">
            <SectionHeading>Keywords</SectionHeading>
            <div className="flex flex-wrap gap-2">
              {pkg.keywords.slice(0, 10).map((kw) => (
                <span
                  key={kw}
                  className="font-fragment text-[10px] text-white/75 border border-white/20 rounded-full px-3 py-1 break-all max-w-full"
                  title={kw}
                >
                  {kw.length > 20 ? `${kw.slice(0, 20)}...` : kw}
                </span>
              ))}
              {pkg.keywords.length > 10 && (
                <span className="font-fragment text-[10px] text-[var(--color-muted)] self-center">
                  +{pkg.keywords.length - 10} more
                </span>
              )}
            </div>
          </section>
        )}

        {/* --- License --- */}
        {(pkg.license || pkg.licensesUrl) && (
          <section className="flex flex-col gap-2">
            <SectionHeading>License</SectionHeading>
            {pkg.licensesUrl ? (
              <a
                href={pkg.licensesUrl}
                target="_blank"
                rel="noopener"
                className="text-[15px] text-white/75 hover:text-[var(--color-orchid)] hover:underline transition-colors w-fit"
              >
                {pkg.license ?? "See License"}
              </a>
            ) : (
              <span className="text-[15px] text-white/75">{pkg.license}</span>
            )}
          </section>
        )}

        <section className="flex flex-col gap-2">
          <SectionHeading>Listing URL</SectionHeading>
          <code className="font-fragment text-[11px] text-[var(--color-muted)] break-all bg-transparent border-none p-0">
            {listingUrl}
          </code>
        </section>
      </div>

      {/* --- Action bar --- */}
      <div className="flex border-t border-white/20">
        {pkg.zipUrl ? (
          <a
            href={pkg.zipUrl}
            download
            className="flex-1 inline-flex items-center justify-center gap-2 min-h-14 bg-[var(--color-electric)] hover:bg-[var(--color-hot-hover)] text-white text-[15px] font-semibold no-underline transition-colors"
          >
            <DownloadIcon /> Direct Download
          </a>
        ) : null}
        <button
          type="button"
          onClick={handleCopyListingUrl}
          className="shrink-0 only:flex-1 inline-flex items-center justify-center px-7 min-h-14 border-0 border-l only:border-l-0 border-white/20 bg-transparent text-white text-[15px] hover:bg-white hover:text-black transition-colors cursor-pointer"
        >
          {copyLabel}
        </button>
      </div>
    </dialog>
  );
}

export default PackageModal;
