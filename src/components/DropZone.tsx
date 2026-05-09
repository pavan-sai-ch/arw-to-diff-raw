"use client";

import { useCallback, useRef, useState } from "react";

interface Props {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export default function DropZone({ onFiles, disabled }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (raw: FileList | null) => {
      if (!raw) return;
      const arw = Array.from(raw).filter((f) =>
        f.name.toLowerCase().endsWith(".arw")
      );
      if (arw.length) onFiles(arw);
    },
    [onFiles]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (!disabled) handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-8 py-16 transition-colors select-none ${
        disabled
          ? "cursor-not-allowed border-gray-700 bg-gray-800/30 text-gray-600"
          : dragging
          ? "border-blue-400 bg-blue-900/20 text-blue-300"
          : "border-gray-600 bg-gray-800/40 text-gray-400 hover:border-gray-400 hover:bg-gray-800/60"
      }`}
    >
      <svg
        className="mb-4 h-12 w-12 opacity-60"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
        />
      </svg>
      <p className="text-lg font-medium">
        {dragging ? "Drop ARW files here" : "Drag & drop ARW files"}
      </p>
      <p className="mt-1 text-sm opacity-60">or click to browse</p>
      <input
        ref={inputRef}
        type="file"
        accept=".arw,.ARW"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
