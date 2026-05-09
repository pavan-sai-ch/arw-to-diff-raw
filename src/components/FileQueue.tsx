"use client";

export type FileStatus = "queued" | "processing" | "done" | "error";

export interface QueueItem {
  id: string;
  file: File;
  status: FileStatus;
  downloadUrl?: string;
  downloadName?: string;
  error?: string;
}

interface Props {
  items: QueueItem[];
}

const statusBadge: Record<FileStatus, { label: string; cls: string }> = {
  queued: { label: "Queued", cls: "bg-gray-700 text-gray-300" },
  processing: { label: "Converting…", cls: "bg-blue-800 text-blue-200 animate-pulse" },
  done: { label: "Done", cls: "bg-green-800 text-green-200" },
  error: { label: "Error", cls: "bg-red-800 text-red-200" },
};

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function FileQueue({ items }: Props) {
  if (!items.length) return null;

  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const badge = statusBadge[item.status];
        return (
          <li
            key={item.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-200">
                {item.file.name}
              </p>
              <p className="text-xs text-gray-500">{formatSize(item.file.size)}</p>
              {item.error && (
                <p className="mt-1 text-xs text-red-400">{item.error}</p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.cls}`}>
                {badge.label}
              </span>
              {item.status === "done" && item.downloadUrl && (
                <a
                  href={item.downloadUrl}
                  download={item.downloadName}
                  className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-500 transition-colors"
                >
                  Download
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
