import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
    length?: number; // default 6
    value?: string;  // controlled value (optional)
    onChange?: (code: string) => void;
    onComplete?: (code: string) => void;
    label?: string;
    disabled?: boolean;
    autoFocus?: boolean;
    error?: string;
};

function onlyDigits(s: string) {
    return (s.match(/\d/g) ?? []).join("");
}

export default function OtpInput({
    length = 6,
    value,
    onChange,
    onComplete,
    label = "Código",
    disabled = false,
    autoFocus = false,
    error,
}: Props) {
    const isControlled = value != null;
    const [internal, setInternal] = useState<string>("");

    const code = isControlled ? value! : internal;
    const digits = useMemo(() => {
        const cleaned = onlyDigits(code).slice(0, length);
        return Array.from({ length }, (_, i) => cleaned[i] ?? "");
    }, [code, length]);

    const refs = useRef<Array<HTMLInputElement | null>>([]);

    // keep internal in sync if parent changes value
    useEffect(() => {
        if (!isControlled) return;
        // do nothing; controlled uses value directly
    }, [isControlled, value]);

    useEffect(() => {
        if (autoFocus && !disabled) refs.current[0]?.focus();
    }, [autoFocus, disabled]);

    function setCode(next: string) {
        const cleaned = onlyDigits(next).slice(0, length);
        if (!isControlled) setInternal(cleaned);
        onChange?.(cleaned);
        if (cleaned.length === length) onComplete?.(cleaned);
    }

    function focusIndex(i: number) {
        refs.current[i]?.focus();
        refs.current[i]?.select();
    }

    function handleChange(i: number, raw: string) {
        if (disabled) return;

        const nextDigits = onlyDigits(raw);

        // User typed a single digit normally
        if (nextDigits.length <= 1) {
            const arr = [...digits];
            arr[i] = nextDigits;
            const next = arr.join("");
            setCode(next);

            if (nextDigits && i < length - 1) focusIndex(i + 1);
            return;
        }

        // User typed/pasted multiple digits into one box
        const arr = [...digits];
        let idx = i;
        for (const d of nextDigits) {
            if (idx >= length) break;
            arr[idx] = d;
            idx++;
        }
        const next = arr.join("");
        setCode(next);
        focusIndex(Math.min(idx, length - 1));
    }

    function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
        if (disabled) return;

        if (e.key === "Backspace") {
            e.preventDefault();
            const arr = [...digits];
            if (arr[i]) {
                // delete current digit
                arr[i] = "";
                setCode(arr.join(""));
                return;
            }
            // move back if current empty
            if (i > 0) {
                arr[i - 1] = "";
                setCode(arr.join(""));
                focusIndex(i - 1);
            }
            return;
        }

        if (e.key === "ArrowLeft" && i > 0) {
            e.preventDefault();
            focusIndex(i - 1);
            return;
        }

        if (e.key === "ArrowRight" && i < length - 1) {
            e.preventDefault();
            focusIndex(i + 1);
            return;
        }
    }

    function handlePaste(i: number, e: React.ClipboardEvent<HTMLInputElement>) {
        if (disabled) return;
        e.preventDefault();
        const text = e.clipboardData.getData("text");
        if (!text) return;
        handleChange(i, text);
    }

    return (
        <div className="w-full">
            {label && (
                <div className="mb-1 text-sm text-gray-600">{label}</div>
            )}

            <div
                className={[
                    "rounded-md border px-3 py-3 transition",
                    error ? "border-rose-600 ring-1 ring-rose-600" : "border-gray-300",
                    !error ? "focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600" : "",
                    disabled ? "bg-gray-50 opacity-70" : "bg-white",
                ].join(" ")}
            >
                <div className="flex items-center justify-between gap-2">
                    {digits.map((d, i) => (
                        <input
                            key={i}
                            value={d}
                            ref={(el) => (refs.current[i] = el)}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            onPaste={(e) => handlePaste(i, e)}
                            disabled={disabled}
                            inputMode="numeric"
                            autoComplete={i === 0 ? "one-time-code" : "off"}
                            maxLength={length} // not very relevant; we sanitize anyway
                            className={[
                                "h-12 w-11 rounded-md border text-center text-lg font-medium",
                                error ? "border-rose-300 focus:border-rose-600 focus:ring-rose-600" : "border-gray-200 focus:border-blue-600 focus:ring-blue-600",
                                "outline-none focus:ring-1",
                                disabled ? "bg-gray-50" : "bg-white",
                            ].join(" ")}
                            aria-label={`Dígito ${i + 1} do código`}
                        />
                    ))}
                </div>
            </div>

            {error && <div className="mt-1 text-sm text-rose-600">{error}</div>}
        </div>
    );
}
