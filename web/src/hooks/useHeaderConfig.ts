import { useEffect } from "react";
import type { HeaderConfig } from "@/components/main/Header";
import { useHeader } from "./useHeader";

export function useHeaderConfig(patch: Partial<HeaderConfig>, resetOnUnmount = true) {
    const { setHeaderPartial, resetHeader } = useHeader();

    useEffect(() => {
        setHeaderPartial(patch);
        return () => {
            if (resetOnUnmount) resetHeader();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetOnUnmount, resetHeader, setHeaderPartial, patch]);
}