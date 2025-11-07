import { useEffect } from "react";
import { useLoading } from "@/hooks/useLoading";

export default function FallbackOverlay() {
  const { show, hide } = useLoading(); // assume hook is typed: { show(): void; hide(): void }

  useEffect(() => {
    show(); // fallback active
    return hide; // fallback done
  }, [show, hide]);

  return null; // overlay is handled by the hook
}
