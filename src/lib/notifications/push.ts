import webpush from "web-push";
import type { PushSubscription } from "@/features/notifications/types";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";
const NOTIFICATION_PUBLIC_KEY = process.env.NOTIFICATION_PUBLIC_KEY ?? "";

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !NOTIFICATION_PUBLIC_KEY) {
  throw new Error("Missing VAPID keys in environment variables");
}

webpush.setVapidDetails(
  "mailto:notifications@hinear.local",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: unknown;
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
): Promise<void> {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload), {
      vapidDetails: {
        subject: "mailto:notifications@hinear.local",
        publicKey: NOTIFICATION_PUBLIC_KEY,
        privateKey: VAPID_PRIVATE_KEY,
      },
      TTL: 3600,
    });
  } catch (error) {
    console.error("Failed to send push notification:", error);
    throw error;
  }
}

export function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64WithPadding = base64 + padding;
  const binaryString = atob(base64WithPadding);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
