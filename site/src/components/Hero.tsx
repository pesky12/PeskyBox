import React, { useState } from "react";
import { motion } from "framer-motion";

// --- Icons ---
const CopyIcon = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
    />
  </svg>
);
const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="currentColor"
    className="text-green-400"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);
const VccIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2.5a.5.5 0 0 1 .5.5v6.5H17a.5.5 0 0 1 0 1h-6.5V17a.5.5 0 0 1-1 0v-6.5H3a.5.5 0 0 1 0-1h6.5V3a.5.5 0 0 1 .5-.5z" />
  </svg>
);

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
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(listingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addUrl = `vcc://vpm/addRepo?url=${encodeURIComponent(listingUrl)}`;

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center pt-20 pb-16 px-4">
      {/* --- Background panel for readability --- */}
      <div className="absolute inset-0 bg-[var(--color-abyss)]/60 backdrop-blur-xl rounded-3xl border border-white/5 -z-10" />
      
      {/* --- The Background Glow (Replaces the hard banner box) --- */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--color-orchid)]/15 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* --- Main Header / Title --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-8"
      >
        {/* Aviane Logo */}
        <div className="mx-auto w-20 h-20 mb-4 flex items-center justify-center drop-shadow-[0_0_15px_rgba(249,168,212,0.4)]">
          <img
            src={`${import.meta.env.BASE_URL}/Aviane logo - Round Safe.png`}
            alt="Aviane"
            className="w-full h-full object-contain"
          />
        </div>

        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-3">
          <span className="bg-clip-text text-transparent bg-linear-to-br from-[var(--color-orchid)] via-[var(--color-flash)] to-[var(--color-bloom)]">
            {name.split(" ")[0]}
          </span>{" "}
          {name.split(" ").slice(1).join(" ")}
        </h1>

        <p className="text-lg text-[var(--color-bloom)]/80 font-medium">
          {description}
        </p>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
          {socials.map((social, index) => (
            <React.Fragment key={social.href}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener"
                className="text-sm font-medium text-[var(--color-muted)] hover:text-white transition-colors border-b border-transparent hover:border-[var(--color-orchid)]/50 pb-0.5"
              >
                {social.label}
              </a>
              {index < socials.length - 1 && (
                <span className="w-1 h-1 rounded-full bg-[var(--color-border)] hidden sm:inline-block" />
              )}
            </React.Fragment>
          ))}
          <span className="w-1 h-1 rounded-full bg-[var(--color-border)] hidden sm:inline-block" />
          <span className="text-sm font-medium text-[var(--color-muted)]">
            Published by{" "}
            <a
              href={author.url}
              target="_blank"
              rel="noopener"
              className="text-[var(--color-orchid)] hover:underline"
            >
              {author.name}
            </a>
          </span>
        </div>
      </motion.div>

      {/* --- The Unified Action Area --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl"
      >
        {/* The Dock */}
        <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl sm:rounded-full border border-white/10 bg-[var(--color-abyss)]/70 backdrop-blur-xl shadow-2xl">
          {/* URL & Copy Block */}
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-between w-full sm:w-auto px-4 py-3 sm:py-0 h-[46px] rounded-xl sm:rounded-full bg-black/40 hover:bg-black/60 border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
          >
            <code className="text-sm font-mono text-white/90 group-hover:text-white truncate transition-colors text-left">
              {listingUrl}
            </code>
            <div className="shrink-0 ml-3 text-white/70 group-hover:text-white transition-colors">
              {copied ? <CheckIcon /> : <CopyIcon />}
            </div>
          </button>

          {/* Primary VCC Button */}
          <a
            href={addUrl}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 h-[46px] px-6 rounded-xl sm:rounded-full bg-[var(--color-electric)] hover:bg-[#a855f7] text-white font-bold text-sm shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all no-underline"
          >
            <VccIcon /> Add Repo to VCC
          </a>
        </div>

        {/* Small Helper underneath */}
        <div className="flex justify-center mt-4">
          <a
            href="#how-to-vcc"
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-orchid)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 5.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm1.5 3a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0v-5a.5.5 0 0 1 .5-.5z"
              />
            </svg>
            How to add to VCC
          </a>
        </div>
      </motion.div>
    </div>
  );
}
