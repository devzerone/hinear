"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let hasAttached = false;
    const attachListeners = () => {
      if (hasAttached || window.workbox === undefined) {
        return false;
      }

      const wb = window.workbox;
      hasAttached = true;

      wb.addEventListener("controlling", () => {
        window.location.reload();
      });

      wb.addEventListener("waiting", () => {
        wb.messageSkipWaiting();
      });

      return true;
    };

    if (attachListeners()) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (attachListeners()) {
        window.clearInterval(intervalId);
      }
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return null;
}

// 전역 타입 선언
declare global {
  interface Window {
    workbox?: {
      register: () => void;
      addEventListener: (event: string, callback: () => void) => void;
      messageSkipWaiting: () => void;
    };
  }
}
