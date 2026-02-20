import { useMemo } from 'react';

export default function ImageUpload({
  label,
  required = false,
  multiple = false,
  file,
  files,
  onChange,
  onMultipleChange,
}) {
  const previewSrc = useMemo(() => {
    try {
      if (multiple) {
        if (!files?.length) return '';
        return URL.createObjectURL(files[0]);
      }
      if (!file) return '';
      return URL.createObjectURL(file);
    } catch {
      return '';
    }
  }, [file, files, multiple]);

  const handleFileChange = (e) => {
    const list = Array.from(e.target.files || []);
    if (multiple) onMultipleChange?.(list);
    else onChange?.(list[0] || null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
        {multiple && files?.length ? (
          <span className="text-[11px] text-slate-500">{files.length} selected</span>
        ) : null}
      </div>

      <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-3 py-4 text-xs text-slate-500 hover:border-emerald-400 hover:bg-emerald-50/40 cursor-pointer transition">
        {previewSrc ? (
          <img src={previewSrc} alt={label} className="w-full h-28 object-cover rounded-xl" />
        ) : (
          <>
            <span className="text-lg">📷</span>
            <span>Click to upload</span>
            <span className="text-[10px] text-slate-400">JPG, PNG, WEBP (max ~10MB)</span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}

