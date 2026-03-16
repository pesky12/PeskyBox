import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { motion, type Variants } from "framer-motion";
import { typeColor, type Package } from "../lib/packages";
import PackageModal from "./PackageModal";
import DotGrid from "./DotGrid";
import { PlusIcon } from "./icons";

interface PackageGridProps {
  packages: Package[];
  listingUrl: string;
}

const DOT_GAP = 39;
const DOT_SPEED = 58;

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

const BURST_COUNT = 11;
const BURST_LIFETIME_MS = 900;

/** Decorative particles that fly out of the VCC button on click. */
function BirdBurst({ onDone }: { onDone: () => void }) {
  const particles = useMemo(
    () =>
      Array.from({ length: BURST_COUNT }, (_, i) => {
        const direction = (Math.PI * 2 * i) / BURST_COUNT + (Math.random() * 0.35 - 0.175);
        const distance = 28 + Math.random() * 26;
        return {
          "--tx": `${(Math.cos(direction) * distance).toFixed(1)}px`,
          "--ty": `${(Math.sin(direction) * distance - 16).toFixed(1)}px`,
          "--rot": `${(Math.random() * 160 - 80).toFixed(1)}deg`,
          "--dur": `${(520 + Math.random() * 260).toFixed(0)}ms`,
          "--delay": `${(Math.random() * 70).toFixed(0)}ms`,
        } as CSSProperties;
      }),
    [],
  );

  useEffect(() => {
    const timer = window.setTimeout(onDone, BURST_LIFETIME_MS);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <span className="bird-burst-layer" aria-hidden="true">
      {particles.map((style, i) => (
        <span key={i} className="bird-particle" style={style} />
      ))}
    </span>
  );
}

/* --- Card --- */
function PackageCard({
  pkg,
  listingUrl,
  onSelect,
}: {
  pkg: Package;
  listingUrl: string;
  onSelect: (pkg: Package) => void;
}) {
  const addUrl = `vcc://vpm/addRepo?url=${encodeURIComponent(listingUrl)}`;
  const tooltipId = `vcc-tooltip-${pkg.id.replace(/[^a-zA-Z0-9]/g, "-")}`;
  const typeTint = typeColor[pkg.type] ?? typeColor.Any;
  const [active, setActive] = useState(false);
  const [bursting, setBursting] = useState(false);

  return (
    <motion.article
      variants={itemVariants}
      className="card-surface flex flex-col h-full overflow-hidden"
      data-package-item
      data-package-name={pkg.displayName.toLowerCase()}
      data-package-id={pkg.id.toLowerCase()}
      onPointerEnter={(event) => event.pointerType === "mouse" && setActive(true)}
      onPointerLeave={(event) => event.pointerType === "mouse" && setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setActive(false);
      }}
    >
      {active && (
        <div className="package-card-dots" aria-hidden="true">
          <DotGrid gap={DOT_GAP} speed={DOT_SPEED} />
        </div>
      )}

      <div className="relative flex items-center justify-between gap-3 px-6 py-3 bg-white/[0.04] border-b border-white/20">
        <span
          className="font-fragment text-xs uppercase tracking-[0.1em]"
          style={{ color: typeTint }}
        >
          {pkg.type}
        </span>
        <code className="font-fragment text-[13px] text-[var(--color-package-meta)] bg-transparent border-none p-0">
          v{pkg.version}
        </code>
      </div>

      <div className="relative flex-1 flex flex-col gap-4 px-6 py-6 min-w-0">
        <div className="min-w-0">
          <h3
            className="font-display text-2xl font-medium text-white leading-[1.15] tracking-[-0.02em] m-0 truncate"
            title={pkg.displayName}
          >
            {pkg.displayName}
          </h3>
          <code
            className="block font-fragment text-[9px] text-white/60 mt-1 truncate bg-transparent border-none p-0"
            title={pkg.id}
          >
            {pkg.id}
          </code>
        </div>
        <p className="text-[15px] font-light text-white/85 m-0 line-clamp-3 leading-relaxed">
          {pkg.description}
        </p>
      </div>

      <div className="relative flex border-t border-white/20">
        <a
          href={addUrl}
          className="group/add relative flex-1 inline-flex items-center justify-center gap-2 min-h-14 bg-[var(--color-electric)] hover:bg-[var(--color-hot-hover)] text-white text-[15px] font-semibold no-underline transition-colors"
          aria-describedby={tooltipId}
          onClick={() => setBursting(true)}
        >
          <PlusIcon size={15} /> Open in VCC
          {bursting && <BirdBurst onDone={() => setBursting(false)} />}
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
          className="shrink-0 inline-flex items-center justify-center px-7 min-h-14 border-0 border-l border-white/20 bg-transparent text-white text-[15px] hover:bg-white hover:text-black transition-colors cursor-pointer"
          onClick={() => onSelect(pkg)}
          aria-label={`View details for ${pkg.displayName}`}
        >
          Info
        </button>
      </div>
    </motion.article>
  );
}

/* --- Grid --- */
export default function PackageGrid({ packages, listingUrl }: PackageGridProps) {
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);

  if (!packages || packages.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--color-muted)] rounded-[25px] border-2 border-[var(--color-border)] bg-[var(--color-void)]/60 backdrop-blur-sm">
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
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            listingUrl={listingUrl}
            onSelect={setSelectedPkg}
          />
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
