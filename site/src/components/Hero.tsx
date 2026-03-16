import React, { useState } from "react";
import { motion } from "framer-motion";
import { CopyIcon, CheckIcon, PlusIcon } from "./icons";
import { useCopy } from "../lib/useCopy";

interface HeroProps {
  name: string;
  description: string;
  listingUrl: string;
  author: { name: string; url: string };
  socials: { label: string; href: string }[];
}

export default function Hero({
  name,
  description,
  listingUrl,
  author,
  socials,
}: HeroProps) {
  const { status, copy } = useCopy(listingUrl);
  const [showSteps, setShowSteps] = useState(false);

  const addUrl = `vcc://vpm/addRepo?url=${encodeURIComponent(listingUrl)}`;

  const firstName = name.split(" ")[0];
  const restName = name.split(" ").slice(1).join(" ");

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center pt-20 pb-16 px-4">
      {/* --- Zone panel --- */}
      <div className="absolute inset-0 bg-[var(--color-void)]/85 backdrop-blur-md rounded-[45px] border-2 border-[var(--color-border)] -z-10" />

      {/* --- Magenta + yellow glow, zone liquid-background colors --- */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--color-electric)]/20 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-24 left-[58%] w-[220px] h-[160px] bg-[var(--color-spark)]/8 blur-[80px] rounded-full pointer-events-none -z-10" />

      {/* --- Header --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-8"
      >
        <img
          src="/Aviane logo - Round Safe.png"
          alt="PeskyBox logo - Aviane brand mark"
          className="mx-auto w-20 h-20 mb-4 object-contain"
          loading="eager"
          decoding="async"
        />

        <h1 className="font-display text-5xl md:text-6xl font-medium tracking-tight text-white mb-3 leading-[1.1] pb-1">
          {firstName}{" "}
          <span className="font-semibold text-[var(--color-electric)]">
            {restName}
          </span>
        </h1>

        <p className="text-lg text-white/85 font-medium">{description}</p>

        {/* --- Socials --- */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
          {socials.map((social, index) => (
            <React.Fragment key={social.href}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener"
                className="text-sm font-medium text-[var(--color-glow)] underline underline-offset-2 hover:text-[var(--color-orchid)] transition-colors"
              >
                {social.label}
              </a>
              {index < socials.length - 1 && (
                <span className="w-1 h-1 rounded-full bg-[var(--color-border)] hidden sm:inline-block" />
              )}
            </React.Fragment>
          ))}
          {socials.length > 0 && (
            <span className="w-1 h-1 rounded-full bg-[var(--color-border)] hidden sm:inline-block" />
          )}
          <span className="text-sm font-medium text-[var(--color-muted)]">
            Published by{" "}
            <a
              href={author.url}
              target="_blank"
              rel="noopener"
              className="text-[var(--color-glow)] underline underline-offset-2 hover:text-[var(--color-orchid)]"
            >
              {author.name}
            </a>
          </span>
        </div>
      </motion.div>

      {/* --- Dock --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl flex flex-col sm:flex-row items-center sm:items-stretch gap-2 sm:h-12"
      >
        <button
          onClick={copy}
          aria-label="Copy listing URL"
          className="flex-1 flex items-center justify-between w-full sm:w-auto px-4 h-12 sm:h-full rounded-[19px] sm:rounded-full bg-black/40 hover:bg-black/60 border-0 transition-colors cursor-pointer group"
        >
          <code className="text-sm font-fragment text-white/90 group-hover:text-white truncate transition-colors text-left">
            {listingUrl}
          </code>
          <span
            className="shrink-0 ml-3 text-white/70 group-hover:text-white transition-colors"
            aria-live="polite"
          >
            {status === "copied" ? (
              <CheckIcon />
            ) : status === "failed" ? (
              <span className="text-xs">Failed</span>
            ) : (
              <CopyIcon />
            )}
          </span>
        </button>

        <div className="w-full sm:w-auto shrink-0 flex h-12 sm:h-full rounded-[19px] sm:rounded-full overflow-hidden bg-[var(--color-electric)]">
          <a
            href={addUrl}
            className="flex-1 flex items-center justify-center gap-2 pl-6 pr-4 hover:bg-[var(--color-hot-hover)] text-white font-bold text-sm transition-colors no-underline"
          >
            <PlusIcon /> Add Repo to VCC
          </a>
          <button
            type="button"
            onClick={() => setShowSteps((open) => !open)}
            aria-expanded={showSteps}
            aria-controls="vcc-manual-steps"
            aria-label="Button not working? Show manual steps"
            title="Button not working? Add it manually"
            className="shrink-0 w-12 border-0 border-l border-white/30 bg-transparent hover:bg-[var(--color-hot-hover)] text-white font-bold text-sm transition-colors cursor-pointer"
          >
            ?
          </button>
        </div>
      </motion.div>

      {/* --- Manual steps, for visitors without the vcc:// handler --- */}
      {showSteps && (
        <div id="vcc-manual-steps" className="mt-6 w-full max-w-2xl text-sm text-white/80">
          <ol className="mt-0 mb-0 pl-5 space-y-2 list-decimal">
            <li>Open <strong className="text-white">VCC</strong> and go to <strong className="text-white">Settings</strong>.</li>
            <li>Click the <strong className="text-white">Packages</strong> tab, then <strong className="text-white">Add Repository</strong>.</li>
            <li>Paste the listing URL above and click <strong className="text-white">Add</strong>.</li>
            <li>Check the info and click <strong className="text-white">I Understand</strong>.</li>
            <li>Open any project to see the packages.</li>
          </ol>
          <p className="text-xs text-white/60 mt-3 mb-0">
            More info at{" "}
            <a
              href="https://vcc.docs.vrchat.com"
              target="_blank"
              rel="noopener"
              className="text-[var(--color-glow)] hover:underline"
            >
              vcc.docs.vrchat.com
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
