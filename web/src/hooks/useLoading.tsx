import { useCallback } from "react";

const BACKDROP_ID = "app-loading-backdrop";
//const STYLE_ID = "app-loading-style";

export function useLoading() {
  const show = useCallback(() => {
    if (document.getElementById(BACKDROP_ID)) return;

    const backdrop = document.createElement("div");
    backdrop.id = BACKDROP_ID;
    backdrop.style.position = "fixed";
    backdrop.style.top = "0";
    backdrop.style.left = "0";
    backdrop.style.width = "100vw";
    backdrop.style.height = "100vh";
    backdrop.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    backdrop.style.display = "flex";
    backdrop.style.alignItems = "center";
    backdrop.style.justifyContent = "center";
    backdrop.style.zIndex = "9999";

    // Spinner element
    const spinner = document.createElement("div");
    spinner.style.width = "50px";
    spinner.style.height = "50px";
    spinner.style.border = "6px solid #f3f3f3";
    spinner.style.borderTop = "6px solid #3498db";
    spinner.style.borderRadius = "50%";
    spinner.style.animation = "spin 1s linear infinite";

    // Add keyframes for the spinner animation
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    backdrop.appendChild(spinner);
    document.body.appendChild(backdrop);
    //backdropRef.current = backdrop;
  }, []);

  const hide = useCallback(() => {
    const el = document.getElementById(BACKDROP_ID);
    if (el) el.remove();
  }, []);

  return { show, hide };
}
