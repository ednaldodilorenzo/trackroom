import React, { useEffect, useMemo, useRef, useState } from "react";

export type AsyncCheckItem = {
  id: string | number;
  label: string;
  [key: string]: unknown;
};

type AsyncMultiCheckSelectProps = {
  label: string;
  value: AsyncCheckItem[];
  onChange: (items: AsyncCheckItem[]) => void;
  fetchOptions: (query: string) => Promise<AsyncCheckItem[]>;
  debounceMs?: number;
  placeholder?: string;

  /** disable item based on conditions */
  isItemDisabled?: (item: AsyncCheckItem, selected: AsyncCheckItem[]) => boolean;

  /** optional: show chips or not */
  showChips?: boolean;

  /** optional: text for empty state */
  emptyText?: string;
};

export default function AsyncMultiCheckSelect({
  label,
  value,
  onChange,
  fetchOptions,
  debounceMs = 500,
  placeholder = "Digite para buscar...",
  isItemDisabled,
  showChips = false,
  emptyText = "Nenhum resultado",
}: AsyncMultiCheckSelectProps) {
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<AsyncCheckItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const debounceRef = useRef<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const selectedIds = useMemo(() => new Set(value.map((v) => v.id)), [value]);

  // Keep selected visible in list (like checkbox multi-select), but filter by query
  useEffect(() => {
    window.clearTimeout(debounceRef.current);

    // If closed, don't fetch
    if (!open) return;

    // For "AsyncSelect-like": fetch even when empty if you want "recent items".
    // Here we fetch only when user types something.
    if (!input.trim()) {
      setOptions([]);
      setLoading(false);
      return;
    }

    debounceRef.current = window.setTimeout(async () => {
      setLoading(true);
      try {
        const result = await fetchOptions(input);
        setOptions(result);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => window.clearTimeout(debounceRef.current);
  }, [input, fetchOptions, debounceMs, open]);

  /* =======================
    Click outside to close
  ======================= */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =======================
    Keyboard navigation
    - Up/Down highlights
    - Space/Enter toggles checkbox
    - Esc closes
  ======================= */
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => Math.min(prev + 1, options.length - 1));
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        break;

      case "Enter":
      case " ":
        e.preventDefault();
        if (options[highlightedIndex]) toggleItem(options[highlightedIndex]);
        break;

      case "Escape":
        e.preventDefault();
        setOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }

  function toggleItem(item: AsyncCheckItem) {
    const disabled = isItemDisabled?.(item, value) ?? false;
    if (disabled) return;

    if (selectedIds.has(item.id)) {
      onChange(value.filter((v) => v.id !== item.id));
    } else {
      onChange([...value, item]);
    }
  }

  function removeItem(id: AsyncCheckItem["id"]) {
    onChange(value.filter((v) => v.id !== id));
  }

  const hasValueOrFocus = Boolean(input) || open || value.length > 0;
  const inputPlaceholder = hasValueOrFocus ? placeholder : " "; // important for floating label

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Material-like text field wrapper */}
      <div className="md-text-field">
        {/* Clickable container to open */}
        <div
          className={[
            "relative",
            open ? "ring-1 ring-[var(--md-primary)]" : "",
          ].join(" ")}
          onClick={() => {
            setOpen(true);
            inputRef.current?.focus();
          }}
        >
          {/* Chips inside field (optional) */}
          {showChips && value.length > 0 && (
            <div className="absolute left-3 right-3 top-[10px] flex flex-wrap gap-1 pr-10">
              {value.map((item) => (
                <span
                  key={item.id}
                  className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                >
                  {item.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.id);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                    aria-label={`Remover ${item.label}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Input */}
          <input
            ref={inputRef}
            value={input}
            placeholder={inputPlaceholder}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            // add extra top padding if chips are shown
            className={[
              "w-full",
              showChips && value.length > 0 ? "pt-12" : "",
            ].join(" ")}
            aria-label={label}
          />

          {/* Floating label */}
          <label>{label}</label>

          {/* End icon (purely visual) */}
          <span className="md-icon end" aria-hidden="true">
            ▾
          </span>
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {loading && <div className="px-3 py-2 text-sm text-gray-500">Carregando...</div>}

          {!loading && options.length === 0 && input.trim() && (
            <div className="px-3 py-2 text-sm text-gray-500">{emptyText}</div>
          )}

          {!loading &&
            options.map((item, idx) => {
              const checked = selectedIds.has(item.id);
              const disabled = isItemDisabled?.(item, value) ?? false;
              const highlighted = idx === highlightedIndex;

              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => toggleItem(item)}
                  disabled={disabled}
                  className={[
                    "flex w-full items-center gap-3 px-3 py-2 text-left text-sm",
                    highlighted ? "bg-gray-100" : "bg-white",
                    disabled ? "cursor-not-allowed opacity-60" : "hover:bg-gray-100",
                  ].join(" ")}
                  role="option"
                  aria-selected={checked}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    readOnly
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  <span className="flex-1">{item.label}</span>
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}
