import { useId, useRef, useState } from "react";
import type { DragEvent, ReactNode } from "react";
import { File as FileIcon, UploadCloud, X } from "lucide-react";
import { cn } from "../../lib/cn";

export type FileRejection = {
  file: File;
  reason: "type" | "size" | "count";
};

export type FileUploadProps = {
  /** Lista controlada de arquivos aceitos. */
  files: File[];
  /** Recebe a nova lista de arquivos aceitos (sem upload real). */
  onFiles: (files: File[]) => void;
  /** Chamado quando algum arquivo é recusado (tipo/tamanho/contagem). */
  onReject?: (rejections: FileRejection[]) => void;
  /** Tipos aceitos no seletor e na validação (ex.: ".pdf,image/*"). */
  accept?: string;
  /** Permite múltiplos arquivos. */
  multiple?: boolean;
  /** Tamanho máximo por arquivo, em bytes. */
  maxSize?: number;
  /** Quantidade máxima de arquivos (somando os já presentes). */
  maxFiles?: number;
  disabled?: boolean;
  /** Texto principal da área. */
  title?: ReactNode;
  /** Texto de apoio (ex.: "PDF até 10 MB"). */
  hint?: ReactNode;
  className?: string;
};

/** Formata bytes em unidade legível (pt-BR). */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const n = bytes / Math.pow(k, i);
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Confere o arquivo contra a lista `accept` (extensões e mimetypes/curingas). */
function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const tokens = accept
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some((tok) => {
    if (tok.startsWith(".")) return name.endsWith(tok);
    if (tok.endsWith("/*")) return type.startsWith(tok.slice(0, -1));
    return type === tok;
  });
}

/**
 * FileUpload / Dropzone — área de arrastar-e-soltar + seletor de arquivos.
 * É só UI + callbacks: NÃO faz upload. Valida tipo (accept), tamanho (maxSize)
 * e contagem (maxFiles), emitindo aceitos em `onFiles` e recusados em `onReject`.
 * Lista os arquivos com tamanho e botão remover. Estados hover/drag/disabled
 * desenhados; acessível por teclado (a área é um botão que abre o seletor).
 */
export function FileUpload({
  files,
  onFiles,
  onReject,
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  disabled,
  title = "Arraste arquivos aqui ou clique para selecionar",
  hint,
  className,
}: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const descId = useId();

  function process(incoming: FileList | File[]) {
    const list = Array.from(incoming);
    const accepted: File[] = [];
    const rejected: FileRejection[] = [];
    const limit = maxFiles ?? Infinity;
    let count = files.length;

    for (const file of list) {
      if (!matchesAccept(file, accept)) {
        rejected.push({ file, reason: "type" });
        continue;
      }
      if (maxSize != null && file.size > maxSize) {
        rejected.push({ file, reason: "size" });
        continue;
      }
      if (count >= limit) {
        rejected.push({ file, reason: "count" });
        continue;
      }
      accepted.push(file);
      count++;
    }

    if (accepted.length > 0) {
      onFiles(multiple ? [...files, ...accepted] : accepted.slice(0, 1));
    }
    if (rejected.length > 0) onReject?.(rejected);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files?.length) process(e.dataTransfer.files);
  }

  function removeAt(index: number) {
    onFiles(files.filter((_, i) => i !== index));
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-describedby={hint ? descId : undefined}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed px-6 py-9 text-center outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
          dragging
            ? "border-action bg-[rgba(79,70,229,0.08)]"
            : "border-line-strong bg-[var(--surface)] hover:border-action hover:bg-[var(--surface-hover)]",
          disabled && "cursor-not-allowed opacity-50 hover:border-line-strong",
        )}
      >
        <span
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors",
            dragging
              ? "bg-action text-fg-on-action"
              : "bg-[rgba(79,70,229,0.14)] text-[var(--tone-action-fg)]",
          )}
          aria-hidden="true"
        >
          <UploadCloud className="h-5 w-5" />
        </span>
        <p className="text-[0.92rem] font-medium text-fg">{title}</p>
        {hint && (
          <p id={descId} className="text-[0.8rem] text-fg-subtle">
            {hint}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) process(e.target.files);
            // permite re-selecionar o mesmo arquivo
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="space-y-2" aria-label="Arquivos selecionados">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center gap-3 rounded-[var(--radius-control)] border border-line bg-[var(--surface)] px-3 py-2.5"
            >
              <span
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[rgba(79,70,229,0.12)] text-[var(--tone-action-fg)]"
                aria-hidden="true"
              >
                <FileIcon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.88rem] font-medium text-fg">
                  {file.name}
                </span>
                <span className="block font-mono text-[0.72rem] text-fg-subtle">
                  {formatBytes(file.size)}
                </span>
              </span>
              <button
                type="button"
                aria-label={`Remover ${file.name}`}
                onClick={() => removeAt(i)}
                disabled={disabled}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-fg-subtle outline-none transition-colors",
                  "hover:bg-[var(--surface-hover)] hover:text-fg",
                  "focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { formatBytes };
