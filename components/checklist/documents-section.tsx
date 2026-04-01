"use client";

import { useState, useRef } from "react";

type Document = {
  id: string;
  name: string;
  url: string;
  size: number;
  contentType: string;
  createdBy: { name: string };
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(contentType: string) {
  if (contentType.startsWith("image/")) return "🖼️";
  if (contentType === "application/pdf") return "📄";
  if (contentType.includes("word")) return "📝";
  if (contentType.includes("sheet") || contentType.includes("excel")) return "📊";
  if (contentType.includes("zip") || contentType.includes("rar")) return "🗜️";
  return "📎";
}

export function DocumentsSection({
  tripId,
  initialDocuments,
}: {
  tripId: string;
  initialDocuments: Document[];
}) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingName, setPendingName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Pre-fill name with filename without extension
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setPendingFile(file);
    setPendingName(nameWithoutExt);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleCancel() {
    setPendingFile(null);
    setPendingName("");
    setError(null);
  }

  async function handleConfirmUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingFile || !pendingName.trim()) return;

    setError(null);
    setUploading(true);
    const formData = new FormData();
    formData.append("file", pendingFile);
    formData.append("name", pendingName.trim());

    const res = await fetch(`/api/trips/${tripId}/documents`, {
      method: "POST",
      body: formData,
    });

    setUploading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao fazer upload.");
      return;
    }

    const doc = await res.json();
    setDocuments((prev) => [doc, ...prev]);
    setPendingFile(null);
    setPendingName("");
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/trips/${tripId}/documents/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-800">Documentos</h3>
        {!pendingFile && (
          <label
            className="px-3 py-1.5 text-sm font-medium rounded-xl cursor-pointer transition-colors bg-blue-600 text-white hover:bg-blue-700"
          >
            + Carregar
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelected}
            />
          </label>
        )}
      </div>

      {/* Pending upload form */}
      {pendingFile && (
        <form
          onSubmit={handleConfirmUpload}
          className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2"
        >
          <p className="text-xs text-blue-600 font-medium">
            {fileIcon(pendingFile.type)} {pendingFile.name} · {formatBytes(pendingFile.size)}
          </p>
          <input
            type="text"
            value={pendingName}
            onChange={(e) => setPendingName(e.target.value)}
            placeholder="Nome do documento"
            required
            autoFocus
            className="w-full px-3 py-2 rounded-xl border border-blue-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading || !pendingName.trim()}
              className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {uploading ? "A carregar…" : "Carregar"}
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-400 text-sm">Nenhum documento carregado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-3 py-2.5 group"
            >
              <span className="text-xl flex-none">{fileIcon(doc.contentType)}</span>
              <div className="flex-1 min-w-0">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-800 hover:text-blue-600 truncate block"
                >
                  {doc.name}
                </a>
                <p className="text-xs text-gray-400">
                  {formatBytes(doc.size)} · {doc.createdBy.name}
                </p>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                className="flex-none text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs p-1"
                aria-label="Eliminar"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
