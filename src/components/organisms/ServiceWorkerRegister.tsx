"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox;

      // 서비스 워커 활성화 대기
      wb.addEventListener("controlling", () => {
        // 새로운 서비스 워커가 제어권을 가져옴
        window.location.reload();
      });

      wb.addEventListener("waiting", () => {
        // 새로운 서비스 워커가 대기 중
        wb.messageSkipWaiting();
      });

      // 서비스 워커 등록
      wb.register();
    } else if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NEXT_PUBLIC_ENABLE_SW === "true"
    ) {
      // 개발 환경에서는 수동으로 서비스 워커 등록
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "[Service Worker] Registered successfully:",
            registration
          );
        })
        .catch((error) => {
          console.error("[Service Worker] Registration failed:", error);
        });
    }
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
