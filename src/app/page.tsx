"use client";

import { useCallback, useState } from "react";
import DropZone from "@/components/DropZone";
import FileQueue, { QueueItem } from "@/components/FileQueue";
import ToolStatus from "@/components/ToolStatus";

let idCounter = 0;
const nextId = () => String(++idCounter);

export default function Home() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [converting, setConverting] = useState(false);

  const addFiles = useCallback((files: File[]) => {
    const newItems: QueueItem[] = files.map((file) => ({
      id: nextId(),
      file,
      status: "queued",
    }));
    setQueue((prev) => [...prev, ...newItems]);
  }, []);

  const convertAll = async () => {
    const pending = queue.filter((q) => q.status === "queued");
    if (!pending.length) return;

    setConverting(true);

    for (const item of pending) {
      // Mark as processing
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: "processing" } : q))
      );

      try {
        const formData = new FormData();
        formData.append("files", item.file);

        const res = await fetch("/api/convert", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Conversion failed" }));
          throw new Error(err.error ?? "Conversion failed");
        }

        const blob = await res.blob();
        const disposition = res.headers.get("Content-Disposition") ?? "";
        const match = disposition.match(/filename="([^"]+)"/);
        const downloadName = match ? match[1] : item.file.name.replace(/\.arw$/i, ".dng");
        const downloadUrl = URL.createObjectURL(blob);

        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: "done", downloadUrl, downloadName }
              : q
          )
        );
      } catch (err) {
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? {
                  ...q,
                  status: "error",
                  error: err instanceof Error ? err.message : "Unknown error",
                }
              : q
          )
        );
      }
    }

    setConverting(false);
  };

  const downloadAllAsZip = async () => {
    const ready = queue.filter((q) => q.status === "queued" || q.status === "done");
    if (!ready.length) return;

    // Re-send all original files as a batch for a single ZIP response
    const allQueued = queue.filter((q) => q.status === "queued");
    if (!allQueued.length) {
      // All already converted individually — nothing to batch
      return;
    }

    setConverting(true);
    const formData = new FormData();
    for (const item of allQueued) {
      formData.append("files", item.file);
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: "processing" } : q))
      );
    }

    try {
      const res = await fetch("/api/convert", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Batch conversion failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "converted.zip";
      a.click();
      URL.revokeObjectURL(url);

      setQueue((prev) =>
        prev.map((q) =>
          allQueued.find((a) => a.id === q.id)
            ? { ...q, status: "done" }
            : q
        )
      );
    } catch (err) {
      setQueue((prev) =>
        prev.map((q) =>
          allQueued.find((a) => a.id === q.id)
            ? {
                ...q,
                status: "error",
                error: err instanceof Error ? err.message : "Unknown error",
              }
            : q
        )
      );
    }

    setConverting(false);
  };

  const queued = queue.filter((q) => q.status === "queued");
  const allDone = queue.length > 0 && queue.every((q) => q.status === "done" || q.status === "error");
  const multipleQueued = queued.length > 1;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          ARW → DNG Converter
        </h1>
        <p className="mt-2 text-gray-400">
          Convert Sony ARW files to DNG for iPhone RAW editing — no quality loss
        </p>
      </div>

      {/* Tool status */}
      <div className="mb-6">
        <ToolStatus />
      </div>

      {/* Drop zone */}
      <DropZone onFiles={addFiles} disabled={converting} />

      {/* Queue */}
      {queue.length > 0 && (
        <div className="mt-6 space-y-4">
          <FileQueue items={queue} />

          {/* Actions */}
          <div className="flex gap-3">
            {queued.length > 0 && (
              <button
                onClick={convertAll}
                disabled={converting}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                {converting ? "Converting…" : `Convert ${queued.length === 1 ? "1 File" : `${queued.length} Files`}`}
              </button>
            )}

            {multipleQueued && !converting && (
              <button
                onClick={downloadAllAsZip}
                disabled={converting}
                className="rounded-lg border border-gray-600 px-4 py-2.5 text-sm font-semibold text-gray-300 hover:border-gray-400 hover:text-white disabled:opacity-50 transition-colors"
              >
                Convert & Download ZIP
              </button>
            )}

            {allDone && (
              <button
                onClick={() => setQueue([])}
                className="rounded-lg border border-gray-700 px-4 py-2.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer hint */}
      <p className="mt-10 text-center text-xs text-gray-600">
        Files are processed locally — nothing is uploaded to any server
      </p>
    </main>
  );
}
