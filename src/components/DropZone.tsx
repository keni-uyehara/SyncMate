// src/components/DropZone.tsx
import React, { useMemo, useRef, useState } from "react";

type Props = {
  /** Called every time the selection changes (add/remove/clear) */
  onFilesSelected: (files: File[]) => void;
  /** Allow multiple files (default true) */
  multiple?: boolean;
  /** Accept string (input accept attribute) */
  accept?: string;
  /** Max size PER file in MB (default 50MB) */
  maxSizeMB?: number;
  /** Max number of files if multiple (default 10) */
  maxFiles?: number;
  /** Main label inside the tile */
  label?: React.ReactNode;
  /** Extra tailwind classes to control size/spacing */
  className?: string;
  /** Hide helper lines inside the tile (default true) */
  hideHelperText?: boolean;
  /** Initial files (optional, uncontrolled by default) */
  defaultFiles?: File[];
};

export default function DropZone({
  onFilesSelected,
  multiple = true,
  accept = ".csv,.xls,.xlsx,.pdf,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv",
  maxSizeMB = 50,
  maxFiles = 10,
  label,
  className = "min-h-[280px] p-12",
  hideHelperText = true,
  defaultFiles = [],
}: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>(defaultFiles);
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => inputRef.current?.click();

  const allowedMimes = useMemo(
    () => new Set([
      "text/csv",
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]),
    []
  );

  const validate = (f: File) => {
    const okType = allowedMimes.has(f.type) || /\.(csv|xls|xlsx|pdf)$/i.test(f.name);
    if (!okType) return `Unsupported file type: ${f.name}`;
    if (f.size > maxSizeMB * 1024 * 1024) return `File too large (> ${maxSizeMB}MB): ${f.name}`;
    return null;
  };

  const uniqKey = (f: File) => `${f.name}-${f.size}-${f.lastModified}`;

  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const currentMap = new Map(files.map((f) => [uniqKey(f), f]));
    const errors: string[] = [];

    for (const f of arr) {
      const err = validate(f);
      if (err) {
        errors.push(err);
        continue;
      }
      const key = uniqKey(f);
      if (!multiple && currentMap.size >= 1) break;
      if (currentMap.size >= maxFiles) break;
      if (!currentMap.has(key)) currentMap.set(key, f);
    }

    if (errors.length) alert(errors.join("\n"));

    const next = Array.from(currentMap.values());
    setFiles(next);
    onFilesSelected(next);
  };

  const removeFile = (key: string) => {
    const next = files.filter((f) => uniqKey(f) !== key);
    setFiles(next);
    onFilesSelected(next);
  };

  const clearAll = () => {
    setFiles([]);
    onFilesSelected([]);
  };

  // Handlers
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); addFiles(e.dataTransfer.files); };
  const onPaste = (e: React.ClipboardEvent) => { const it = e.clipboardData?.files; if (it?.length) addFiles(it); };

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload report"
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openPicker()}
        onClick={openPicker}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onPaste={onPaste}
        className={`w-full border-2 border-dashed rounded-xl text-center transition select-none
          ${dragActive ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"}
          ${className}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center h-full">
          <svg width="48" height="48" viewBox="0 0 24 24" className="mx-auto mb-4 text-gray-400">
            <path
              fill="currentColor"
              d="M12 16V8m0 0l-3 3m3-3l3 3M6 20h12a2 2 0 0 0 2-2V9.828a2 2 0 0 0-.586-1.414L14.586 3.586A2 2 0 0 0 13.172 3H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"
            />
          </svg>

          <p className="text-base text-gray-700">
            {label ?? (multiple ? "Drag and drop your report files here" : "Drag and drop your report file here")}
          </p>

          {!hideHelperText && (
            <>
              <p className="text-sm text-gray-500 mt-1">
                Supports CSV, Excel, PDF {multiple ? `• up to ${maxFiles} files` : ""}
              </p>
              <p className="text-xs text-gray-400 mt-1">Maximum file size: {maxSizeMB}MB</p>
            </>
          )}
        </div>
      </div>

      {/* Selected files list */}
      {files.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-700">
              {files.length} file{files.length > 1 ? "s" : ""} selected
            </div>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {files.map((f) => {
              const key = uniqKey(f);
              const sizeMB = (f.size / (1024 * 1024)).toFixed(2);
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-xs"
                >
                  <span className="truncate max-w-[220px]" title={f.name}>
                    {f.name} <span className="text-gray-500">({sizeMB}MB)</span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${f.name}`}
                    onClick={() => removeFile(key)}
                    className="rounded-full hover:bg-gray-200 w-5 h-5 inline-flex items-center justify-center"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
