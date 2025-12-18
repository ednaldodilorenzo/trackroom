import { useEffect, useRef, useState } from "react";

export type AsyncSelectItem = {
    id: string | number;
    label: string;
};

type Props = {
    label: string;
    value: AsyncSelectItem[];
    onChange: (items: AsyncSelectItem[]) => void;
    fetchOptions: (query: string) => Promise<AsyncSelectItem[]>;
    debounceMs?: number;
    placeholder?: string;
};

export default function AsyncMultiSelect({
    label,
    value,
    onChange,
    fetchOptions,
    debounceMs = 400,
    placeholder = "Digite para buscar...",
}: Props) {
    const [input, setInput] = useState("");
    const [options, setOptions] = useState<AsyncSelectItem[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<number | undefined>(undefined);

    const selectedIds = new Set(value.map((v) => v.id));

    useEffect(() => {
        if (!input.trim()) {
            setOptions([]);
            return;
        }

        window.clearTimeout(debounceRef.current);

        debounceRef.current = window.setTimeout(async () => {
            setLoading(true);
            try {
                const result = await fetchOptions(input);
                setOptions(result.filter((o) => !selectedIds.has(o.id)));
            } finally {
                setLoading(false);
            }
        }, debounceMs);

        return () => window.clearTimeout(debounceRef.current);
    }, [input, fetchOptions, debounceMs, selectedIds]);

    function handleSelect(item: AsyncSelectItem) {
        onChange([...value, item]);
        setInput("");
        setOptions([]);
        setOpen(false);
    }

    function removeItem(id: AsyncSelectItem["id"]) {
        onChange(value.filter((v) => v.id !== id));
    }

    return (
        <div className="relative w-full">
            {/* Label */}
            <label className="mb-1 block text-sm text-gray-600">
                {label}
            </label>

            {/* Input container */}
            <div
                className={`flex flex-wrap items-center gap-1 rounded-md border px-2 py-2 transition
          ${open ? "border-blue-600 ring-1 ring-blue-600" : "border-gray-300"}
        `}
                onClick={() => setOpen(true)}
            >
                {/* Selected chips */}
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
                        >
                            ×
                        </button>
                    </span>
                ))}

                {/* Input */}
                <input
                    value={input}
                    placeholder={placeholder}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setOpen(true)}
                    className="flex-1 min-w-[120px] border-none outline-none bg-transparent text-sm"
                />
            </div>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                    {loading && (
                        <div className="px-3 py-2 text-sm text-gray-500">
                            Carregando...
                        </div>
                    )}

                    {!loading && options.length === 0 && input && (
                        <div className="px-3 py-2 text-sm text-gray-500">
                            Nenhum resultado
                        </div>
                    )}

                    {!loading &&
                        options.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100"
                            >
                                {item.label}
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
