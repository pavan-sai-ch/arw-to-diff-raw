"use client";

import { useEffect, useState } from "react";

interface ToolInfo {
  tool: "dng-converter" | "dcraw" | null;
  label: string | null;
  outputFormat: string | null;
  status: "ready" | "missing";
}

export default function ToolStatus() {
  const [info, setInfo] = useState<ToolInfo | null>(null);

  useEffect(() => {
    fetch("/api/check-tools")
      .then((r) => r.json())
      .then(setInfo)
      .catch(() =>
        setInfo({ tool: null, label: null, outputFormat: null, status: "missing" })
      );
  }, []);

  if (!info) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-gray-400">
        Checking for conversion tools…
      </div>
    );
  }

  if (info.status === "missing") {
    return (
      <div className="rounded-lg border border-red-700 bg-red-900/20 px-4 py-3 text-sm">
        <p className="font-semibold text-red-400">No conversion tool found.</p>
        <p className="mt-1 text-red-300/80">
          Install one of the following, then restart the dev server:
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-red-300/70">
          <li>
            <span className="font-medium text-red-300">Adobe DNG Converter</span> —
            free download from adobe.com → install to /Applications
          </li>
          <li>
            <span className="font-medium text-red-300">dcraw</span> —{" "}
            <code className="rounded bg-red-900/40 px-1">brew install dcraw</code>
          </li>
        </ul>
      </div>
    );
  }

  const isDng = info.tool === "dng-converter";

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${
        isDng
          ? "border-green-700 bg-green-900/20 text-green-300"
          : "border-yellow-700 bg-yellow-900/20 text-yellow-300"
      }`}
    >
      <span className="font-semibold">{info.label}</span>
      {" — "}
      {isDng ? (
        <>
          outputs <span className="font-mono">.dng</span> (true RAW, full iPhone
          RAW editing)
        </>
      ) : (
        <>
          outputs <span className="font-mono">.tiff</span> 16-bit lossless
          (fallback — install Adobe DNG Converter for true RAW)
        </>
      )}
    </div>
  );
}
