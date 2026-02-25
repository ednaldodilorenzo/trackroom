import { useOutletContext } from "react-router-dom";
import type { HeaderConfig } from "@/components/main/Header";

export type HeaderOutletContext = {
    setHeaderConfig: React.Dispatch<React.SetStateAction<HeaderConfig>>;
    setHeaderPartial: (patch: Partial<HeaderConfig>) => void;
    resetHeader: () => void;
};

export function useHeader() {
    return useOutletContext<HeaderOutletContext>();
}