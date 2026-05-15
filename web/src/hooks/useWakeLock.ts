import { useEffect, useRef } from "react";

export function useWakeLock(enabled: boolean = true) {
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled) return;

    async function requestWakeLock() {
      try {
        // verifica suporte
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");

          console.log("Wake Lock ativo");

          wakeLockRef.current.addEventListener("release", () => {
            console.log("Wake Lock liberado");
          });
        }
      } catch (err) {
        console.error("Erro ao ativar Wake Lock:", err);
      }
    }

    requestWakeLock();

    // Reativar quando usuário voltar para aba
    async function handleVisibilityChange() {
      if (
        wakeLockRef.current !== null &&
        document.visibilityState === "visible"
      ) {
        requestWakeLock();
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
    };
  }, [enabled]);
}